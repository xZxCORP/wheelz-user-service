import { companyContract, type CompanyCreate } from '@zcorp/wheelz-contracts';

import { server } from '../server.js';
import { CompanyService } from '../services/company.js';
import { MembershipService } from '../services/membership.js';
import { UserService } from '../services/user.js';

const userService = new UserService();
const memberService = new MembershipService();
const companyService = new CompanyService(userService, memberService);

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
      const company = await companyService.show(Number(companyId));

      if (!company) {
        return {
          status: 404,
          body: {
            message: "L'entreprise n'a pas été trouvé.",
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
            message: "L'utilisateur n'existe pas",
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
            message: 'Erreur côté serveur.',
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
            message: "L'entreprise n'a pas été trouvé.",
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
