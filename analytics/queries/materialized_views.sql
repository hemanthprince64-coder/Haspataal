-- Materialized View for Revenue Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_metrics AS
SELECT 
    hospital_id,
    date_trunc('day', timestamp) as day,
    SUM((metadata->>'amount')::decimal) as total_revenue,
    COUNT(id) as transaction_count
FROM "EventLog"
WHERE event_type = 'bill_paid'
GROUP BY hospital_id, date_trunc('day', timestamp);

-- Materialized View for Retention Stats (30-day window)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_retention_stats AS
SELECT 
    hospital_id,
    COUNT(id) FILTER (WHERE event_type = 'followup_created') as scheduled,
    COUNT(id) FILTER (WHERE event_type = 'followup_completed') as completed,
    (COUNT(id) FILTER (WHERE event_type = 'followup_completed')::float / 
     NULLIF(COUNT(id) FILTER (WHERE event_type = 'followup_created'), 0) * 100) as retention_rate
FROM "EventLog"
WHERE timestamp > (now() - interval '30 days')
GROUP BY hospital_id;

-- Materialized View for Network Benchmarks (Cross-tenant anonymized)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_network_benchmarks AS
SELECT 
    AVG(retention_rate) as network_avg_retention,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY retention_rate) as top_10_percentile_retention
FROM mv_retention_stats;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mv_revenue_hospital ON mv_revenue_metrics (hospital_id);
CREATE INDEX IF NOT EXISTS idx_mv_retention_hospital ON mv_retention_stats (hospital_id);

-- Refresh Function (to be called via cron/worker)
-- REFRESH MATERIALIZED VIEW mv_revenue_metrics;
-- REFRESH MATERIALIZED VIEW mv_retention_stats;
-- REFRESH MATERIALIZED VIEW mv_network_benchmarks;
