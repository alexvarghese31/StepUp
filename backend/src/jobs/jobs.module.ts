import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './job.entity';
import { ExternalJobsService } from './external-jobs.service';
import { ProfilesModule } from '../profiles/profiles.module';
import { JobsGatewayModule } from 'src/gateway/jobs.module';
import { JobsAggregatorService } from './jobs-aggregator.service';
import { Profile } from '../profiles/profile.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Profile, User]), ProfilesModule, JobsGatewayModule, HttpModule],
  providers: [JobsService, JobsAggregatorService, ExternalJobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
