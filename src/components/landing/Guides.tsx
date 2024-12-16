import { useTranslation } from "next-i18next";
import Link from 'next/link';
import Image from 'next/image';

const Guides = () => {
  const { t } = useTranslation();

  const guides = [
    {
      category: t("landing.guides.getting_started.category"),
      title: t("landing.guides.getting_started.title"),
      description: t("landing.guides.getting_started.description"),
      image: "/images/guides/getting-started.webp",
      href: "/guides/getting-started"
    },
    {
      category: t("landing.guides.ai_content.category"),
      title: t("landing.guides.ai_content.title"),
      description: t("landing.guides.ai_content.description"),
      image: "/images/guides/ai-content.webp",
      href: "/guides/ai-content"
    },
    {
      category: t("landing.guides.seo.category"),
      title: t("landing.guides.seo.title"),
      description: t("landing.guides.seo.description"),
      image: "/images/guides/seo-optimization.webp",
      href: "/guides/seo-optimization"
    }
  ];

  return (
    <div className="w-full py-16 bg-gray-50">
      <div className="relative flex flex-col px-5 mx-auto space-y-5 md:w-3/4">
        <div className="flex flex-col items-center">
          <h6 className="font-bold text-center text-blue-600 uppercase">
            {t("landing.guides.heading")}
          </h6>
          <h2 className="text-4xl font-bold text-center">
            <span className="block">{t("landing.guides.title")}</span>
          </h2>
          <p className="mt-4 text-center text-gray-600">
            {t("landing.guides.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 py-10 md:grid-cols-3">
          {guides.map((guide, index) => (
            <Link
              key={index}
              href={guide.href}
              className="group p-5 space-y-5 transition bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2"
            >
              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                <Image
                  src={guide.image}
                  alt={guide.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-600">
                  {guide.category}
                </h3>
                <h2 className="text-2xl font-bold">
                  {guide.title}
                </h2>
                <p className="mt-2 text-gray-600">
                  {guide.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guides;