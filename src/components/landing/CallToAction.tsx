import { useTranslation } from "next-i18next";
import Link from 'next/link';

const CallToAction = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center w-full py-20 bg-blue-600">
      <div className="relative flex flex-col px-5 mx-auto space-y-8 md:w-3/4">
        <div className="flex flex-col space-y-6 text-white">
          <h2 className="text-4xl font-extrabold text-center md:text-6xl">
            <span className="block">{t("landing.cta.title")}</span>
          </h2>
          <h3 className="text-2xl font-bold text-center md:text-4xl">
            <span className="block">{t("landing.cta.subtitle")}</span>
          </h3>
          <p className="max-w-2xl mx-auto text-center text-lg text-blue-100">
            {t("landing.cta.description")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:space-x-4 md:flex-row">
          <Link
            href="/auth/register"
            className="px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-200"
          >
            {t("landing.cta.primary_action")}
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            {t("landing.cta.secondary_action")}
          </Link>
        </div>
        <div className="flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-white">{t("landing.cta.feature_1")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-white">{t("landing.cta.feature_2")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-white">{t("landing.cta.feature_3")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;