import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { theme, GlobalStyles } from './styles';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ziegfried/peepeth',
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <GlobalStyles />
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('root')
);
