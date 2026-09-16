-- Ubersuggest SEO snapshot altyapısı
-- Idempotent: tekrar çalıştırılabilir.

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_snapshots" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "ubersuggestProjectId" TEXT,
    "snapshotDate" DATE NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ubersuggest',
    "organicKeywordsCount" INTEGER,
    "estimatedOrganicTraffic" DOUBLE PRECISION,
    "paidKeywordsCount" INTEGER,
    "estimatedPaidTraffic" DOUBLE PRECISION,
    "domainAuthority" INTEGER,
    "totalBacklinks" INTEGER,
    "referringDomains" INTEGER,
    "followBacklinks" INTEGER,
    "nofollowBacklinks" INTEGER,
    "siteHealthScore" DOUBLE PRECISION,
    "previousSiteHealthScore" DOUBLE PRECISION,
    "crawledPagesCount" INTEGER,
    "successfulPagesCount" INTEGER,
    "redirectedPagesCount" INTEGER,
    "brokenPagesCount" INTEGER,
    "blockedPagesCount" INTEGER,
    "totalIssuesCount" INTEGER,
    "auditLastCrawledAt" TIMESTAMP(3),
    "trackedKeywordsCount" INTEGER,
    "keywordsUpCount" INTEGER,
    "keywordsDownCount" INTEGER,
    "keywordsUnchangedCount" INTEGER,
    "top3Old" INTEGER,
    "top3New" INTEGER,
    "top10Old" INTEGER,
    "top10New" INTEGER,
    "top100Old" INTEGER,
    "top100New" INTEGER,
    "notRankingOld" INTEGER,
    "notRankingNew" INTEGER,
    "newContentOpportunityCount" INTEGER,
    "existingContentOpportunityCount" INTEGER,
    "quickWinOpportunityCount" INTEGER,
    "aiVisibilityPercentage" DOUBLE PRECISION,
    "aiVisibilityChange" DOUBLE PRECISION,
    "aiAverageRank" DOUBLE PRECISION,
    "aiAverageRankChange" DOUBLE PRECISION,
    "aiTotalMentions" INTEGER,
    "aiShareOfVoice" DOUBLE PRECISION,
    "aiSentimentScore" DOUBLE PRECISION,
    "aiSentimentLabel" TEXT,
    "aiTotalAnswers" INTEGER,
    "aiTotalPrompts" INTEGER,
    "aiTotalCompetitors" INTEGER,
    "rawResponseJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_ubersuggest_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_domain_history" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "estimatedOrganicTraffic" DOUBLE PRECISION,
    "organicKeywordsCount" INTEGER,
    "estimatedPaidTraffic" DOUBLE PRECISION,
    "paidKeywordsCount" INTEGER,
    "topTierKeywords" INTEGER,
    "secondTierKeywords" INTEGER,
    "thirdTierKeywords" INTEGER,
    "fourthTierKeywords" INTEGER,

    CONSTRAINT "seo_ubersuggest_domain_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_keywords" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "searchIntent" TEXT,
    "currentPosition" INTEGER,
    "searchVolume" INTEGER,
    "seoDifficulty" DOUBLE PRECISION,
    "paidDifficulty" DOUBLE PRECISION,
    "competition" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "estimatedTraffic" DOUBLE PRECISION,
    "rankingUrl" TEXT,
    "rankingPath" TEXT,
    "positionGroup" TEXT,
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "seo_ubersuggest_keywords_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_rank_tracking" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "language" TEXT,
    "locationId" TEXT,
    "device" TEXT,
    "searchVolume" INTEGER,
    "seoDifficulty" DOUBLE PRECISION,
    "competition" DOUBLE PRECISION,
    "oldPosition" INTEGER,
    "oldPositionDate" TIMESTAMP(3),
    "oldRankingUrl" TEXT,
    "newPosition" INTEGER,
    "newPositionDate" TIMESTAMP(3),
    "newRankingUrl" TEXT,
    "positionChange" INTEGER,
    "rankingStatus" TEXT,
    "isRankingTop100" BOOLEAN,
    "isUnstable" BOOLEAN,
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "seo_ubersuggest_rank_tracking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_average_positions" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "averagePosition" DOUBLE PRECISION,

    CONSTRAINT "seo_ubersuggest_average_positions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_top_pages" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT,
    "pageTitle" TEXT,
    "estimatedOrganicTraffic" DOUBLE PRECISION,
    "backlinks" INTEGER,
    "referringDomains" INTEGER,
    "facebookShares" INTEGER,
    "pinterestShares" INTEGER,
    "redditShares" INTEGER,

    CONSTRAINT "seo_ubersuggest_top_pages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_competitors" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "competitorDomain" TEXT NOT NULL,
    "commonKeywordCount" INTEGER,
    "competitorOrganicKeywordsCount" INTEGER,
    "keywordGapCount" INTEGER,
    "competitorEstimatedOrganicTraffic" DOUBLE PRECISION,
    "competitorBacklinks" INTEGER,
    "competitorDomainAuthority" INTEGER,

    CONSTRAINT "seo_ubersuggest_competitors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_backlinks" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceDomain" TEXT,
    "targetUrl" TEXT,
    "anchorText" TEXT,
    "firstSeen" TIMESTAMP(3),
    "lastSeen" TIMESTAMP(3),
    "sourceDomainRank" INTEGER,
    "sourcePageRank" INTEGER,
    "backlinkType" TEXT,
    "followStatus" TEXT,

    CONSTRAINT "seo_ubersuggest_backlinks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_anchor_texts" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "anchorText" TEXT NOT NULL,
    "externalRootDomains" INTEGER,
    "externalPages" INTEGER,

    CONSTRAINT "seo_ubersuggest_anchor_texts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_linking_domains" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "referringDomain" TEXT NOT NULL,
    "detectedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "seo_ubersuggest_linking_domains_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_backlink_opportunities" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "referringDomain" TEXT NOT NULL,
    "competitorDomain" TEXT,
    "ourDomain" TEXT,
    "linksToCompetitor" INTEGER,
    "linksToUs" INTEGER,
    "opportunityStatus" TEXT,

    CONSTRAINT "seo_ubersuggest_backlink_opportunities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_audit_issues" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "issueId" TEXT NOT NULL,
    "issueCategory" TEXT,
    "issueLevel" TEXT,
    "issueCount" INTEGER,
    "seoImpact" TEXT,
    "difficulty" TEXT,

    CONSTRAINT "seo_ubersuggest_audit_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_audit_issue_urls" (
    "id" SERIAL NOT NULL,
    "auditIssueId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "issueStatus" TEXT,
    "recommendation" TEXT,
    "ignored" BOOLEAN,
    "diffStatus" TEXT,

    CONSTRAINT "seo_ubersuggest_audit_issue_urls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_opportunities" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "opportunityType" TEXT NOT NULL,
    "opportunitySubtype" TEXT,
    "keyword" TEXT,
    "currentPosition" INTEGER,
    "searchVolume" INTEGER,
    "seoDifficulty" DOUBLE PRECISION,
    "paidDifficulty" DOUBLE PRECISION,
    "competition" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "rankingUrl" TEXT,
    "estimatedTraffic" DOUBLE PRECISION,
    "impact" TEXT,
    "effort" TEXT,
    "approved" BOOLEAN,
    "opportunityStatus" TEXT,

    CONSTRAINT "seo_ubersuggest_opportunities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_pagespeed" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "device" TEXT NOT NULL,
    "status" TEXT,
    "performanceScore" DOUBLE PRECISION,
    "seoScore" DOUBLE PRECISION,
    "accessibilityScore" DOUBLE PRECISION,
    "bestPracticesScore" DOUBLE PRECISION,
    "coreWebVitalsStatus" TEXT,
    "lcp" DOUBLE PRECISION,
    "inp" DOUBLE PRECISION,
    "cls" DOUBLE PRECISION,
    "fcp" DOUBLE PRECISION,
    "ttfb" DOUBLE PRECISION,
    "speedIndex" DOUBLE PRECISION,
    "checkedAt" TIMESTAMP(3),

    CONSTRAINT "seo_ubersuggest_pagespeed_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_ai_providers" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "visibilityPercentage" DOUBLE PRECISION,
    "visibilityChange" DOUBLE PRECISION,
    "averageRank" DOUBLE PRECISION,
    "averageRankChange" DOUBLE PRECISION,
    "totalMentions" INTEGER,
    "sentimentScore" DOUBLE PRECISION,
    "sentimentLabel" TEXT,
    "positiveKeywordsJson" JSONB,
    "negativeKeywordsJson" JSONB,

    CONSTRAINT "seo_ubersuggest_ai_providers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_ai_competitors" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "brandName" TEXT NOT NULL,
    "isUserBrand" BOOLEAN,
    "isTracked" BOOLEAN,
    "isPinned" BOOLEAN,
    "averageRank" DOUBLE PRECISION,
    "totalMentions" INTEGER,
    "visibilityPercentage" DOUBLE PRECISION,
    "sentimentScore" DOUBLE PRECISION,
    "sentimentPositivePercentage" DOUBLE PRECISION,
    "sentimentNegativePercentage" DOUBLE PRECISION,
    "sentimentNeutralPercentage" DOUBLE PRECISION,
    "sentimentLabel" TEXT,

    CONSTRAINT "seo_ubersuggest_ai_competitors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_ai_intents" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "informationalCount" INTEGER,
    "navigationalCount" INTEGER,
    "commercialCount" INTEGER,
    "transactionalCount" INTEGER,

    CONSTRAINT "seo_ubersuggest_ai_intents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_projects" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "ubersuggestProjectId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "projectTitle" TEXT,
    "projectStatus" TEXT,
    "projectType" TEXT,
    "updateFrequency" TEXT,
    "mobileRankTrackingEnabled" BOOLEAN,
    "pixelRankTrackingEnabled" BOOLEAN,
    "alertsEnabled" BOOLEAN,
    "hasAiBrandTracking" BOOLEAN,
    "trackedKeywordCount" INTEGER,
    "trackedCompetitorCount" INTEGER,
    "trackedLocationCount" INTEGER,
    "keywordsLastUpdatedAt" TIMESTAMP(3),
    "auditLastUpdatedAt" TIMESTAMP(3),
    "trafficValueLastUpdatedAt" TIMESTAMP(3),
    "keywordLimit" INTEGER,
    "keywordUsed" INTEGER,
    "competitorLimit" INTEGER,
    "competitorUsed" INTEGER,
    "locationLimit" INTEGER,
    "locationUsed" INTEGER,
    "aiPromptLimit" INTEGER,
    "aiPromptUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_ubersuggest_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_project_locations" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "language" TEXT,
    "locationId" TEXT,

    CONSTRAINT "seo_ubersuggest_project_locations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "seo_ubersuggest_project_competitors" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "competitorDomain" TEXT NOT NULL,
    "language" TEXT,
    "locationId" TEXT,

    CONSTRAINT "seo_ubersuggest_project_competitors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_snapshots_clientId_snapshotDate_idx" ON "seo_ubersuggest_snapshots"("clientId", "snapshotDate");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_snapshots_domain_idx" ON "seo_ubersuggest_snapshots"("domain");

CREATE UNIQUE INDEX IF NOT EXISTS "seo_ubersuggest_snapshots_clientId_domain_snapshotDate_sour_key" ON "seo_ubersuggest_snapshots"("clientId", "domain", "snapshotDate", "source");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_domain_history_snapshotId_idx" ON "seo_ubersuggest_domain_history"("snapshotId");

CREATE UNIQUE INDEX IF NOT EXISTS "seo_ubersuggest_domain_history_snapshotId_yearMonth_key" ON "seo_ubersuggest_domain_history"("snapshotId", "yearMonth");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_keywords_snapshotId_idx" ON "seo_ubersuggest_keywords"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_keywords_snapshotId_keyword_idx" ON "seo_ubersuggest_keywords"("snapshotId", "keyword");

CREATE UNIQUE INDEX IF NOT EXISTS "seo_ubersuggest_keywords_snapshotId_keyword_rankingUrl_key" ON "seo_ubersuggest_keywords"("snapshotId", "keyword", "rankingUrl");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_rank_tracking_snapshotId_idx" ON "seo_ubersuggest_rank_tracking"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_rank_tracking_snapshotId_keyword_idx" ON "seo_ubersuggest_rank_tracking"("snapshotId", "keyword");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_average_positions_snapshotId_idx" ON "seo_ubersuggest_average_positions"("snapshotId");

CREATE UNIQUE INDEX IF NOT EXISTS "seo_ubersuggest_average_positions_snapshotId_date_key" ON "seo_ubersuggest_average_positions"("snapshotId", "date");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_top_pages_snapshotId_idx" ON "seo_ubersuggest_top_pages"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_competitors_snapshotId_idx" ON "seo_ubersuggest_competitors"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_backlinks_snapshotId_idx" ON "seo_ubersuggest_backlinks"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_backlinks_snapshotId_sourceDomain_idx" ON "seo_ubersuggest_backlinks"("snapshotId", "sourceDomain");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_anchor_texts_snapshotId_idx" ON "seo_ubersuggest_anchor_texts"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_linking_domains_snapshotId_idx" ON "seo_ubersuggest_linking_domains"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_linking_domains_snapshotId_status_idx" ON "seo_ubersuggest_linking_domains"("snapshotId", "status");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_backlink_opportunities_snapshotId_idx" ON "seo_ubersuggest_backlink_opportunities"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_audit_issues_snapshotId_idx" ON "seo_ubersuggest_audit_issues"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_audit_issues_snapshotId_issueCategory_idx" ON "seo_ubersuggest_audit_issues"("snapshotId", "issueCategory");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_audit_issue_urls_auditIssueId_idx" ON "seo_ubersuggest_audit_issue_urls"("auditIssueId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_opportunities_snapshotId_idx" ON "seo_ubersuggest_opportunities"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_opportunities_snapshotId_opportunityType_idx" ON "seo_ubersuggest_opportunities"("snapshotId", "opportunityType");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_pagespeed_snapshotId_idx" ON "seo_ubersuggest_pagespeed"("snapshotId");

CREATE UNIQUE INDEX IF NOT EXISTS "seo_ubersuggest_pagespeed_snapshotId_device_key" ON "seo_ubersuggest_pagespeed"("snapshotId", "device");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_ai_providers_snapshotId_idx" ON "seo_ubersuggest_ai_providers"("snapshotId");

CREATE UNIQUE INDEX IF NOT EXISTS "seo_ubersuggest_ai_providers_snapshotId_provider_key" ON "seo_ubersuggest_ai_providers"("snapshotId", "provider");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_ai_competitors_snapshotId_idx" ON "seo_ubersuggest_ai_competitors"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_ai_intents_snapshotId_idx" ON "seo_ubersuggest_ai_intents"("snapshotId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_projects_clientId_idx" ON "seo_ubersuggest_projects"("clientId");

CREATE UNIQUE INDEX IF NOT EXISTS "seo_ubersuggest_projects_clientId_ubersuggestProjectId_key" ON "seo_ubersuggest_projects"("clientId", "ubersuggestProjectId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_project_locations_projectId_idx" ON "seo_ubersuggest_project_locations"("projectId");

CREATE INDEX IF NOT EXISTS "seo_ubersuggest_project_competitors_projectId_idx" ON "seo_ubersuggest_project_competitors"("projectId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_snapshots_clientId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_snapshots" ADD CONSTRAINT "seo_ubersuggest_snapshots_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_domain_history_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_domain_history" ADD CONSTRAINT "seo_ubersuggest_domain_history_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_keywords_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_keywords" ADD CONSTRAINT "seo_ubersuggest_keywords_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_rank_tracking_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_rank_tracking" ADD CONSTRAINT "seo_ubersuggest_rank_tracking_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_average_positions_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_average_positions" ADD CONSTRAINT "seo_ubersuggest_average_positions_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_top_pages_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_top_pages" ADD CONSTRAINT "seo_ubersuggest_top_pages_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_competitors_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_competitors" ADD CONSTRAINT "seo_ubersuggest_competitors_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_backlinks_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_backlinks" ADD CONSTRAINT "seo_ubersuggest_backlinks_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_anchor_texts_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_anchor_texts" ADD CONSTRAINT "seo_ubersuggest_anchor_texts_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_linking_domains_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_linking_domains" ADD CONSTRAINT "seo_ubersuggest_linking_domains_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_backlink_opportunities_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_backlink_opportunities" ADD CONSTRAINT "seo_ubersuggest_backlink_opportunities_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_audit_issues_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_audit_issues" ADD CONSTRAINT "seo_ubersuggest_audit_issues_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_audit_issue_urls_auditIssueId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_audit_issue_urls" ADD CONSTRAINT "seo_ubersuggest_audit_issue_urls_auditIssueId_fkey" FOREIGN KEY ("auditIssueId") REFERENCES "seo_ubersuggest_audit_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_opportunities_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_opportunities" ADD CONSTRAINT "seo_ubersuggest_opportunities_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_pagespeed_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_pagespeed" ADD CONSTRAINT "seo_ubersuggest_pagespeed_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_ai_providers_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_ai_providers" ADD CONSTRAINT "seo_ubersuggest_ai_providers_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_ai_competitors_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_ai_competitors" ADD CONSTRAINT "seo_ubersuggest_ai_competitors_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_ai_intents_snapshotId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_ai_intents" ADD CONSTRAINT "seo_ubersuggest_ai_intents_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_ubersuggest_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_projects_clientId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_projects" ADD CONSTRAINT "seo_ubersuggest_projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_project_locations_projectId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_project_locations" ADD CONSTRAINT "seo_ubersuggest_project_locations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "seo_ubersuggest_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'seo_ubersuggest_project_competitors_projectId_fkey') THEN
    ALTER TABLE "seo_ubersuggest_project_competitors" ADD CONSTRAINT "seo_ubersuggest_project_competitors_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "seo_ubersuggest_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
