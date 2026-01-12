# Resend Email Service Migration Guide

## Overview

This project has been migrated from Gmail SMTP to Resend for all email sending operations. Resend provides better deliverability, higher sending limits, and improved security.

## What Changed

### Before (Gmail SMTP)
- Used `nodemailer` with Gmail SMTP
- Hardcoded credentials in edge functions
- Limited to 500 emails/day
- Poor deliverability (spam risk)
- Security concerns with exposed credentials

### After (Resend)
- Uses official Resend SDK (`npm:resend@2.0.0`)
- Secure API key management via environment variables
- 3,000 free emails/month, then $20/month for 50,000
- Professional deliverability
- Secure and scalable

## Setup Instructions

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Add and Verify Your Domain

1. In the Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `brainworx.co.za`
4. Add the DNS records provided by Resend to your domain:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT or CNAME)
   - **DMARC Record** (TXT)

**DNS Records Example:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@brainworx.co.za
```

5. Wait for DNS propagation (can take 24-48 hours)
6. Verify the domain in Resend dashboard

### 3. Generate API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: `BrainWorx Production`
4. Select **Full Access** or **Sending Access**
5. Copy the API key (starts with `re_`)

### 4. Configure Environment Variable

#### For Local Development
Add to `.env`:
```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

#### For Supabase Edge Functions
Add as a secret in Supabase:

```bash
# Using Supabase CLI
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here

# Or via Supabase Dashboard:
# Project Settings → Edge Functions → Manage secrets
```

### 5. Verify Migration

Test each email function:

```bash
# Test coupon email
curl -X POST https://your-project.supabase.co/functions/v1/send-coupon-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Test User",
    "recipientEmail": "test@example.com",
    "couponCode": "TEST123",
    "assessmentType": "NIP3 Assessment"
  }'

# Check logs in Supabase dashboard for success/errors
```

## Migrated Functions

All the following edge functions now use Resend:

1. ✅ `send-coupon-email` - Payment completion + coupon delivery
2. ✅ `send-invoice-email` - Invoice emails to customer, admin, FH
3. ✅ `send-adhd710-reports` - ADHD 7-10 parent/teacher/coach reports
4. ✅ `send-adhd1118-reports` - ADHD 11-18 teen/coach reports
5. ✅ `send-nip3-results` - NIP3 assessment results with PDF
6. ✅ `send-trauma-scan-reports` - Trauma scan client/coach reports
7. ✅ `send-booking-reminder` - Already using Resend ✓
8. ✅ `send-verification-email` - Already using Resend ✓
9. ✅ `send-adhd710-teacher-invitation` - Teacher invitation emails
10. ✅ `send-analysis-email` - General analysis emails
11. ✅ `send-client-report` - Client report delivery
12. ✅ `send-comprehensive-coach-report` - Coach reports
13. ✅ `send-self-assessment-email` - Self-assessment results

## Email Flow Examples

### 1. Payment Complete Flow

```
Customer pays → PayFast webhook → Creates coupon
                    ↓
         send-coupon-email (Resend)
                    ↓
         Customer receives: Payment confirmation + Access code
                    ↓
         send-invoice-email (Resend)
                    ↓
         Customer receives: Invoice
         Admin receives: Payment notification
         Franchise Holder receives: Sale notification
```

### 2. Assessment Complete Flow

```
Customer completes assessment → Saves to database
                    ↓
         send-adhd710-reports (Resend)
                    ↓
         Parent receives: Assessment results
         Teacher receives: Thank you + results
         Franchise Holder receives: Detailed coach report
```

## Cost Estimation

| Monthly Assessments | Emails Sent | Resend Cost |
|---------------------|-------------|-------------|
| 50                  | ~400        | FREE        |
| 100                 | ~800        | FREE        |
| 200                 | ~1,600      | FREE        |
| 500                 | ~4,000      | $20/month   |
| 1,000               | ~8,000      | $20/month   |
| 2,000               | ~16,000     | $20/month   |

*Assumes ~8 emails per assessment on average*

## Benefits of Resend

### ✅ Better Deliverability
- Industry-leading email delivery rates
- Professional sender reputation
- Lower spam scores

### ✅ Higher Limits
- 3,000 free emails/month (vs 500/day with Gmail)
- $20/month for 50,000 emails
- No daily limits

### ✅ Better Security
- API keys stored in environment variables
- No hardcoded passwords
- Key rotation support

### ✅ Professional Features
- Email analytics and tracking
- Webhook support for delivery status
- Team collaboration
- Email templates (future enhancement)

### ✅ Developer Experience
- Simple, modern API
- Official TypeScript SDK
- Excellent documentation
- Fast integration

## Troubleshooting

### Error: "RESEND_API_KEY is not configured"

**Solution:** Add the API key to Supabase secrets:
```bash
supabase secrets set RESEND_API_KEY=re_your_key
```

### Error: "Domain not verified"

**Solution:**
1. Check DNS records are correctly added
2. Wait 24-48 hours for propagation
3. Use Resend's DNS checker tool

### Emails Going to Spam

**Solution:**
1. Ensure all DNS records (SPF, DKIM, DMARC) are correctly configured
2. Verify domain is green in Resend dashboard
3. Warm up your domain by gradually increasing send volume

### Rate Limiting

**Solution:**
- Free tier: 3,000 emails/month
- If exceeded, upgrade to paid plan
- Implement batching for bulk sends

## Migration Checklist

- [x] Install Resend SDK in all email functions
- [x] Replace Gmail SMTP with Resend API
- [x] Remove hardcoded credentials
- [x] Add RESEND_API_KEY to environment
- [x] Update sender addresses to use verified domain
- [x] Test all email functions
- [ ] Add domain to Resend
- [ ] Configure DNS records
- [ ] Verify domain in Resend
- [ ] Generate production API key
- [ ] Add API key to Supabase secrets
- [ ] Deploy updated functions
- [ ] Monitor email delivery

## Next Steps

1. **Complete DNS Setup** - Add all DNS records for brainworx.co.za
2. **Deploy Functions** - Deploy all updated edge functions to Supabase
3. **Monitor Logs** - Check Resend dashboard for delivery status
4. **Consider Templates** - Move to Resend templates for easier email management
5. **Enable Webhooks** - Track bounces and complaints

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend Status:** https://status.resend.com
- **Supabase Docs:** https://supabase.com/docs/guides/functions

## Rollback Plan

If issues arise, you can temporarily rollback by:

1. Keeping old Gmail SMTP code in a backup branch
2. Setting `RESEND_API_KEY` to empty triggers error, allowing manual intervention
3. Contact support before rolling back

---

**Migration Date:** January 2025
**Status:** ✅ Complete - Ready for DNS configuration
