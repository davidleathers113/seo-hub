import { useTranslation } from "next-i18next";
import Image from 'next/image';

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      quote: t("landing.testimonials.content_agency.quote"),
      author: t("landing.testimonials.content_agency.author"),
      role: t("landing.testimonials.content_agency.role"),
      company: t("landing.testimonials.content_agency.company"),
      image: "/images/testimonials/content-agency.webp"
    },
    {
      quote: t("landing.testimonials.freelancer.quote"),
      author: t("landing.testimonials.freelancer.author"),
      role: t("landing.testimonials.freelancer.role"),
      company: t("landing.testimonials.freelancer.company"),
      image: "/images/testimonials/freelancer.webp"
    },
    {
      quote: t("landing.testimonials.marketing_team.quote"),
      author: t("landing.testimonials.marketing_team.author"),
      role: t("landing.testimonials.marketing_team.role"),
      company: t("landing.testimonials.marketing_team.company"),
      image: "/images/testimonials/marketing-team.webp"
    }
  ];

  return (
    <div className="w-full py-16">
      <div className="relative flex flex-col px-5 mx-auto space-y-5 md:w-3/4">
        <div className="flex flex-col items-center">
          <h6 className="font-bold text-center text-blue-600 uppercase">
            {t("landing.testimonials.heading")}
          </h6>
          <h2 className="text-4xl font-bold text-center">
            <span className="block">{t("landing.testimonials.title")}</span>
          </h2>
          <p className="mt-4 text-center text-gray-600">
            {t("landing.testimonials.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col p-6 space-y-4 bg-white rounded-lg shadow-lg"
            >
              <div className="flex-grow">
                <p className="text-gray-600 italic">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <a
            href="https://trustpilot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-500"
          >
            <span>{t("landing.testimonials.more_reviews")}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;