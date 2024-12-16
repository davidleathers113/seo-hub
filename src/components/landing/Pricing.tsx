import { useTranslation } from "next-i18next";
import { CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const Pricing = () => {
  const { t } = useTranslation();

  const plans = {
    starter: {
      name: t("landing.pricing.starter.name"),
      price: t("landing.pricing.starter.price"),
      period: t("landing.pricing.period"),
      features: [
        t("landing.pricing.starter.features.aiGeneration"),
        t("landing.pricing.starter.features.basicSeo"),
        t("landing.pricing.starter.features.contentTemplates"),
        t("landing.pricing.starter.features.basicAnalytics"),
        t("landing.pricing.starter.features.basicWorkflow")
      ]
    },
    professional: {
      name: t("landing.pricing.professional.name"),
      price: t("landing.pricing.professional.price"),
      period: t("landing.pricing.period"),
      features: [
        t("landing.pricing.professional.features.everything"),
        t("landing.pricing.professional.features.advancedAi"),
        t("landing.pricing.professional.features.advancedSeo"),
        t("landing.pricing.professional.features.teamCollaboration"),
        t("landing.pricing.professional.features.customWorkflows"),
        t("landing.pricing.professional.features.apiAccess"),
        t("landing.pricing.professional.features.prioritySupport")
      ]
    }
  };

  return (
    <div className="w-full py-16">
      <div className="relative flex flex-col w-3/4 mx-auto space-y-5">
        <div className="flex flex-col items-center">
          <h6 className="font-bold text-center text-blue-600 uppercase">
            {t("landing.pricing.heading")}
          </h6>
          <h2 className="text-4xl font-bold text-center">
            <span className="block">{t("landing.pricing.title")}</span>
          </h2>
          <p className="mt-4 text-center text-gray-600">
            {t("landing.pricing.subtitle")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 space-y-8 md:space-y-0 md:space-x-8 md:flex-row">
          {/* Starter Plan */}
          <div className="flex flex-col items-start overflow-hidden bg-white border rounded-lg md:w-1/2">
            <div className="w-full p-10 space-y-5">
              <span className="px-5 py-1 text-sm text-blue-600 uppercase bg-blue-100 rounded-full">
                {plans.starter.name}
              </span>
              <h2 className="space-x-2 text-6xl">
                <span className="font-extrabold">{plans.starter.price}</span>
                <small className="text-lg text-gray-400">{plans.starter.period}</small>
              </h2>
            </div>
            <div className="flex flex-col w-full h-full p-10 space-y-5 bg-gray-50 border-t">
              <Link
                href="/auth/register?plan=starter"
                className="px-10 py-3 text-lg text-center text-blue-600 bg-white rounded shadow hover:bg-blue-50"
              >
                {t("landing.pricing.starter.cta")}
              </Link>
              <div className="space-y-5">
                <h6 className="uppercase">{t("landing.pricing.included")}</h6>
                <ul className="space-y-3 text-gray-600">
                  {plans.starter.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Professional Plan */}
          <div className="flex flex-col items-start overflow-hidden bg-white border rounded-lg md:w-1/2">
            <div className="w-full p-10 space-y-5">
              <span className="px-5 py-1 text-sm text-blue-600 uppercase bg-blue-100 rounded-full">
                {plans.professional.name}
              </span>
              <h2 className="space-x-2 text-6xl">
                <span className="font-extrabold">{plans.professional.price}</span>
                <small className="text-lg text-gray-400">{plans.professional.period}</small>
              </h2>
            </div>
            <div className="flex flex-col w-full h-full p-10 space-y-5 bg-gray-50 border-t">
              <Link
                href="/auth/register?plan=professional"
                className="px-10 py-3 text-lg text-center text-white bg-blue-600 rounded shadow hover:bg-blue-500"
              >
                {t("landing.pricing.professional.cta")}
              </Link>
              <div className="space-y-5">
                <h6 className="uppercase">{t("landing.pricing.included")}</h6>
                <ul className="space-y-3 text-gray-600">
                  {plans.professional.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;