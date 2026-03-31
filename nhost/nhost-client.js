import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  backendUrl: 'https://jkkvgwknlmxishrpreql.n.host',
  functions: {
    timeout: 30000,
    onError: (error) => {
      console.error('Chyba v funkci:', error);
    },
  },
});

export { nhost };
