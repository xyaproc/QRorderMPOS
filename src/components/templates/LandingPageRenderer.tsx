import { notFound } from 'next/navigation';
import TemplateModernMinimalist from './TemplateModernMinimalist';
import TemplateDarkLuxury from './TemplateDarkLuxury';
import TemplateWarmCoffee from './TemplateWarmCoffee';
import TemplateColorfulTrendy from './TemplateColorfulTrendy';
import TemplateElegantClassic from './TemplateElegantClassic';

export default function LandingPageRenderer({ restaurant, tenant }: { restaurant: any, tenant: string }) {
  const templateName = restaurant.theme?.templateName || 'modern-minimalist';

  switch (templateName) {
    case 'modern-minimalist':
      return <TemplateModernMinimalist restaurant={restaurant} tenant={tenant} />;
    case 'dark-luxury':
      return <TemplateDarkLuxury restaurant={restaurant} tenant={tenant} />;
    case 'warm-coffee':
      return <TemplateWarmCoffee restaurant={restaurant} tenant={tenant} />;
    case 'colorful-trendy':
      return <TemplateColorfulTrendy restaurant={restaurant} tenant={tenant} />;
    case 'elegant-classic':
      return <TemplateElegantClassic restaurant={restaurant} tenant={tenant} />;
    default:
      return <TemplateModernMinimalist restaurant={restaurant} tenant={tenant} />;
  }
}
