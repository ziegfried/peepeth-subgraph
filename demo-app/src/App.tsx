import React from 'react';
import { GlobalStyles, Wrapper } from './styles';
import Stats from './containers/Stats';

const App: React.FC = () => {
  return (
    <Wrapper>
      <GlobalStyles />
      <h3>Peepeth Stats</h3>
      <Stats />
    </Wrapper>
  );
};

export default App;
