import { Typography } from '../../components/ui/typography';

export default function PrivacyPolicy() {
  return (
    <main className="p-8">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-4">
        <div>
          <Typography.H1 className="mb-4">Privacy Policy</Typography.H1>
          <Typography.P className="mb-2">
            We respect your privacy. We only collect your email address and basic profile
            information to allow you to book tennis lessons. We do not sell your data.
          </Typography.P>
          <Typography.P className="mb-2">
            If you would like your information deleted, please contact us at
            marialaurentennis@info.com.
          </Typography.P>
        </div>
      </div>
    </main>
  );
}
