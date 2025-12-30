import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JobsGateway } from 'src/gateway/jobs.gateway';

@Injectable()
export class ExternalJobsService {
  private readonly logger = new Logger(ExternalJobsService.name);

  constructor(
    @InjectRepository(Job) private readonly jobsRepo: Repository<Job>,
    private readonly http: HttpService,
    private readonly gateway: JobsGateway,
  ) {}

  async fetchAndSaveNow(options: { country?: string; results_per_page?: number } = {}) {
    const app_id = process.env.ADZUNA_APP_ID;
    const app_key = process.env.ADZUNA_APP_KEY;
    const country = options.country || process.env.ADZUNA_COUNTRY || 'us';

    if (!app_id || !app_key) {
      this.logger.warn('Adzuna credentials not configured — skipping fetch');
      return [];
    }

    const perPage = options.results_per_page || 50;
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${app_id}&app_key=${app_key}&results_per_page=${perPage}`;

    try {
      const resp = await firstValueFrom(this.http.get(url));
      const data = resp.data;
      if (!data || !Array.isArray(data.results)) return [];

      const savedJobs: Job[] = [];
      function normalizeJobType(contract_time: string | undefined) {
        if (!contract_time) return 'full-time';
        return contract_time.replace(/_/g, '-');
      }

      for (const r of data.results) {
        const existsExternal = await this.jobsRepo.findOne({ where: { externalSource: 'adzuna', externalId: String(r.id) } });
        if (existsExternal) continue;

        const exists = await this.jobsRepo.findOne({ where: { title: r.title, company: r.company && r.company.display_name } });
        if (exists) continue;

        const currency = (r.salary_currency && String(r.salary_currency).toUpperCase()) || (country === 'in' ? 'INR' : undefined);

        const job = this.jobsRepo.create({
          title: r.title,
          company: r.company && r.company.display_name ? r.company.display_name : (r.company || 'Unknown'),
          description: r.description ?? '',
          skills: '',
          location: r.location && (r.location.display_name || (r.location.area && r.location.area.join(', '))) || '',
          salaryMin: r.salary_min || null,
          salaryMax: r.salary_max || null,
          experienceRequired: null,
          jobType: normalizeJobType(r.contract_time),
          postedBy: null,
          status: 'open',
          isExternal: true,
          externalSource: 'adzuna',
          externalId: String(r.id),
          externalUrl: r.redirect_url || r.url || null,
          externalCurrency: currency || null,
          raw: r,
        } as Partial<Job>);

        const saved = await this.jobsRepo.save(job as any);
        savedJobs.push(saved);
        this.gateway.notifyNewJob(saved);
      }

      this.logger.log(`Saved ${savedJobs.length} new external jobs`);
      return savedJobs;
    } catch (err) {
      this.logger.error('Failed to fetch Adzuna', err as any);
      return [];
    }
  }
}
