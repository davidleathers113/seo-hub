import { useTranslation } from "next-i18next";
import {
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8 text-blue-600" />,
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.description")
    },
    {
      icon: <DocumentTextIcon className="w-8 h-8 text-blue-600" />,
      title: t("landing.features.content.title"),
      description: t("landing.features.content.description")
    },
    {
      icon: <ChartBarIcon className="w-8 h-8 text-blue-600" />,
      title: t("landing.features.seo.title"),
      description: t("landing.features.seo.description")
    },
    {
      icon: <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />,
      title: t("landing.features.research.title"),
      description: t("landing.features.research.description")
    },
    {
      icon: <PencilSquareIcon className="w-8 h-8 text-blue-600" />,
      title: t("landing.features.editing.title"),
      description: t("landing.features.editing.description")
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8 text-blue-600" />,
      title: t("landing.features.workflow.title"),
      description: t("landing.features.workflow.description")
    }
  ];

  return (
    <div className="w-full py-16 bg-gray-50">
      <div className="relative flex flex-col w-3/4 mx-auto space-y-5">
        <div className="flex flex-col items-center">
          <h6 className="font-bold text-center text-blue-600 uppercase">
            {t("landing.features.heading")}
          </h6>
          <h2 className="text-4xl font-bold text-center">
            <span className="block">{t("landing.features.title")}</span>
          </h2>
          <p className="mt-4 text-center text-gray-600">
            {t("landing.features.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-start justify-start p-6 space-y-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-3 bg-blue-50 rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;