# CI/CD Pipeline Setup

This document explains how to set up the GitHub Actions CI/CD pipeline for automated testing and deployment.

## Overview

The CI/CD pipeline consists of:

1. **Pre-deployment checks** (PRs and master branch)

   - Type checking
   - Linting
   - Unit tests
   - Build verification
   - Security audit

2. **Deployment** (master branch only)

   - Deploy to Vercel production

3. **Post-deployment E2E tests** (master branch only)
   - Run Playwright tests against live environment

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

### 1. Vercel Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions, then add:

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### How to get these values:

1. **VERCEL_TOKEN**:

   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**:
   - Go to your Vercel project settings
   - Look for "Project ID" in the general settings
   - For Organization ID, check your account settings

Alternatively, you can run:

```bash
npx vercel env pull .env.local
```

This will create a `.env.local` file with your project configuration.

## Workflow Files

### `.github/workflows/ci-cd.yml`

Main workflow that runs on:

- **Pull requests**: Tests and security checks only
- **Master/main branch**: Full CI/CD pipeline including deployment and E2E tests

### `.github/workflows/pr-checks.yml`

Lightweight workflow for pull requests that runs:

- Type checking
- Linting
- Unit tests
- Build verification
- Security checks

## Pipeline Stages

### 1. Test Stage

- ✅ Type checking (`npm run type-check`)
- ✅ Linting (`npm run lint`)
- ✅ Unit tests (`npm run test`)
- ✅ Build verification (`npm run build`)

### 2. Deploy Stage (master only)

- ✅ Deploy to Vercel production
- ✅ Wait for deployment to be ready

### 3. E2E Tests Stage (master only)

- ✅ Install Playwright browsers
- ✅ Run E2E tests against live deployment
- ✅ Upload test results and reports

### 4. Security Stage

- ✅ Security audit (`npm audit`)
- ✅ Check for outdated dependencies

### 5. Analysis Stage (master only)

- ✅ Bundle analysis (optional)
- ✅ Performance metrics

## Environment Variables for E2E Tests

If your E2E tests need specific environment variables, add them to the workflow:

```yaml
- name: Run E2E tests against live environment
  run: npx playwright test --base-url=https://${{ needs.deploy.outputs.preview-url }}
  env:
    NODE_ENV: production
    # Add your custom env vars here
    STRIPE_PUBLIC_KEY: ${{ secrets.STRIPE_PUBLIC_KEY }}
    FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
```

## Disabling Vercel Auto-Deploy

Since we're now using GitHub Actions for deployment, you should disable Vercel's automatic deployments:

1. Go to your Vercel project settings
2. Navigate to "Git" section
3. Disable "Auto Deploy" for the master branch

This prevents conflicts between GitHub Actions and Vercel's built-in deployment.

## Monitoring and Debugging

### Viewing Results

- **GitHub Actions**: Go to your repository → Actions tab
- **Test Results**: Download artifacts from the Actions tab
- **Playwright Reports**: Available as artifacts after E2E tests

### Common Issues

1. **Deployment fails**: Check Vercel token and project configuration
2. **E2E tests fail**: Verify the deployment URL is correct
3. **Build fails**: Check for TypeScript or linting errors

### Local Testing

Test the workflow locally:

```bash
# Test the build process
npm run type-check
npm run lint
npm run test
npm run build

# Test E2E tests locally
npm run test:e2e
```

## Customization

### Adding More Tests

Add new test steps to the workflow:

```yaml
- name: Run custom tests
  run: npm run custom-test
```

### Changing Deployment Strategy

Modify the deploy job to use different strategies:

- Staging deployment first
- Blue-green deployment
- Canary releases

### Performance Monitoring

Add performance monitoring:

```yaml
- name: Lighthouse CI
  run: npx lhci autorun
```

## Security Considerations

- Never commit secrets to the repository
- Use least-privilege tokens
- Regularly rotate Vercel tokens
- Review security audit results
- Keep dependencies updated
