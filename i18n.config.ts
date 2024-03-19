import { getRequestConfig } from 'next-intl/server'; // Can be imported from a shared config
import { notFound } from 'next/navigation';

// Can be imported from a shared config
const locales = ['en-US', 'zh-CN'];

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as never)) notFound();

    return {
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});
