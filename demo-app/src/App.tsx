import React, { useState } from 'react';
import Stats from './containers/Stats';
import Accounts from './containers/Accounts';
import Layout from './components/Layout';
import AccountDetails from './containers/AccountDetails';
import Message from './components/Message';

const App: React.FC = () => {
  const [selectedAccount, selectAccount] = useState<string | null>(null);

  return (
    <Layout
      header={<Stats />}
      sidebar={<Accounts selectedAccount={selectedAccount} onSelectAccount={selectAccount} />}
    >
      {selectedAccount ? (
        <AccountDetails key={selectedAccount} account={selectedAccount} />
      ) : (
        <Message text="(Select account on the left)" />
      )}
    </Layout>
  );
};

export default App;
