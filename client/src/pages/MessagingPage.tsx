import Layout from '../components/layout/Layout';
import MessagingInterface from '../components/messaging/MessagingInterface';

const MessagingPage = () => {
  return (
    <Layout>
      <div className="h-full">
        <MessagingInterface />
      </div>
    </Layout>
  );
};

export default MessagingPage;
