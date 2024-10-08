import { generateOpenApi } from '@ts-rest/open-api';
import { userContract } from '@zcorp/wheelz-contracts';

export const openApiDocument = generateOpenApi(
  userContract,
  {
    info: {
      title: 'Wheelz User Service',
      version: '1.0.0',
    },
  },
  {
    setOperationId: true,
  }
);
