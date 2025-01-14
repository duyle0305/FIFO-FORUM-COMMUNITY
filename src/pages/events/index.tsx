import { Card, Divider, Empty, Flex } from 'antd';

import PageBreadcrumbs from '@/components/core/page-breadcrumbs';
import { useEventListing } from '@/hooks/query/event/use-event-listing';

import EventItem from './components/event-item';

const EventsPage = () => {
    const { data: events } = useEventListing();

    return (
        <Card>
            <PageBreadcrumbs />

            <Divider />

            {events?.length ? (
                <Flex align="center" justify="space-between" wrap gap={10}>
                    {events?.map(event => (
                        <EventItem key={event.eventId} event={event} />
                    ))}
                </Flex>
            ) : (
                <Empty />
            )}
        </Card>
    );
};

export default EventsPage;
