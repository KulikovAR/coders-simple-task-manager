import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SeoStatsTest({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="SEO Test" />
            <div className="p-8">
                <h1 className="text-2xl font-bold text-white">SEO Test Page</h1>
                <p className="text-white mt-4">This is a test page to check if the component loads.</p>
            </div>
        </AuthenticatedLayout>
    );
}
