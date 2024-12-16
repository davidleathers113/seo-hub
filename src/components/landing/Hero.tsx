import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslation } from "next-i18next";

const Hero = () => {
  const { status: sessionStatus } = useSession();
  const [showMenu, setMenuVisibility] = useState(false);
  const { t } = useTranslation();

  const toggleMenu = () => setMenuVisibility(!showMenu);

  const navigationLinks = [
    {
      href: '/dashboard',
      label: t("common.label.dashboard"),
      description: t("common.description.dashboard")
    },
    {
      href: '/auth/signin',
      label: t("common.label.signin"),
      description: t("common.description.signin")
    },
    {
      href: '/auth/signup',
      label: t("common.label.signup"),
      description: t("common.description.signup")
    },
    {
      href: '/settings',
      label: t("common.label.settings"),
      description: t("common.description.settings")
    }
  ];

  return (
    <div className="w-full py-10">
      <div className="relative flex flex-col px-10 mx-auto space-y-5 md:w-3/4">
        <header className="flex items-center justify-between space-x-3">
          <Link href="/" className="text-2xl font-bold">
            ContentForge
          </Link>
          <button className="md:hidden" onClick={toggleMenu}>
            {!showMenu ? (
              <Bars3Icon className="w-8 h-8" />
            ) : (
              <XMarkIcon className="w-8 h-8" />
            )}
          </button>
          <div
            className={[
              'items-center justify-center md:flex-row md:flex md:relative md:bg-transparent md:shadow-none md:top-0 md:backdrop-blur-none md:space-x-3',
              showMenu
                ? 'absolute z-50 flex flex-col py-5 space-x-0 rounded shadow-xl md:py-0 left-8 right-8 bg-white top-24 space-y-3 md:space-y-0 px-5'
                : 'hidden',
            ].join(' ')}
          >
            <nav className="flex flex-col w-full space-x-0 space-y-3 text-center md:space-y-0 md:space-x-3 md:flex-row">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-5 py-2 rounded hover:bg-gray-100 group"
                >
                  <span className="font-semibold">{link.label}</span>
                  <span className="block text-sm text-gray-500 group-hover:text-gray-700">
                    {link.description}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center pt-10 mx-auto md:w-3/5">
          <h1 className="text-6xl font-extrabold text-center">
            <span className="block">{t("landing.hero.title")}</span>
            <span className="block text-blue-600">{t("landing.hero.subtitle")}</span>
          </h1>
          <p className="mt-5 text-center text-gray-600">
            {t("landing.hero.description")}
          </p>
        </div>
        <div className="flex items-center justify-center space-x-5">
          <Link
            href="/auth/register"
            className="px-10 py-3 text-center text-white bg-blue-600 rounded shadow hover:bg-blue-500"
          >
            {t("landing.hero.cta.primary")}
          </Link>
          <Link
            href="/demo"
            className="px-10 py-3 text-center text-blue-600 rounded shadow hover:bg-blue-50"
          >
            {t("landing.hero.cta.secondary")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;