import { companyContract, type CompanyCreate, type CompanyWithUser } from '@zcorp/wheelz-contracts';

import { server } from '../server.js';
import { CompanyService } from '../services/company.js';
import { UserService } from '../services/user.js';

const companyService = new CompanyService();
const userService = new UserService();

export const companyRouter = server.router(companyContract.contract, {
  index: {
    handler: async () => {
      const companies = await companyService.index();

      return {
        status: 200,
        body: {
          data: companies,
        },
      };
    },
  },
  show: {
    handler: async (input) => {
      const companyId = input.params.id;
      const company: CompanyWithUser | undefined = await companyService.show(Number(companyId));

      if (!company) {
        return {
          status: 404,
          body: {
            message: 'Company not found',
          },
        };
      }

      return {
        status: 200,
        body: {
          data: company,
        },
      };
    },
  },
  create: {
    handler: async (input) => {
      const companyParameters = input.body;

      const manager = await userService.show(companyParameters.ownerId);
      if (!manager) {
        return {
          status: 404,
          body: {
            message: 'User do not exist',
          },
        };
      }

      const mappedCompanyParameters: CompanyCreate = {
        name: companyParameters.name,
        vatNumber: companyParameters.vatNumber,
        headquartersAddress: companyParameters.headquartersAddress,
        country: companyParameters.country,
        companyType: companyParameters.companyType,
        companySize: companyParameters.companySize,
        companySector: companyParameters.companySector,
      };

      const createdCompany = await companyService.create(mappedCompanyParameters, manager.id);
      if (!createdCompany) {
        return {
          status: 500,
          body: {
            message: 'Unexpexted error',
          },
        };
      }

      return {
        status: 201,
        body: {
          data: createdCompany,
        },
      };
    },
  },
  update: {
    handler: async (input) => {
      const companyParameters = input.body;
      const companyId = input.params.id;

      const updatedCompanyWithUsers = await companyService.update(
        Number(companyId),
        companyParameters
      );
      if (!updatedCompanyWithUsers) {
        return {
          status: 404,
          body: {
            message: 'Company not found',
          },
        };
      }

      return {
        status: 200,
        body: {
          data: updatedCompanyWithUsers,
        },
      };
    },
  },
});
