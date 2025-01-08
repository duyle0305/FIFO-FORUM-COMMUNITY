import PageBreadcrumbs from '@/components/core/page-breadcrumbs';

import AdminFeedbackList from './components/admin-feedback-list';
import AdminFeedbackWrapper from './layout/admin-feedback-wrapper';

const AdminFeedbackPage = () => {
    return (
        <AdminFeedbackWrapper>
            <PageBreadcrumbs />

            <AdminFeedbackList />
        </AdminFeedbackWrapper>
    );
};

export default AdminFeedbackPage;
