import { companyContract, type Company, type CompanyCreate, type CompanyWithUser, type CompanyWithUsersResponse, type User } from "@zcorp/wheelz-contracts";
import { server } from "../server.js";
import { CompanyService } from "../services/company.js";
import { number } from "zod";
import { UserService } from "../services/user.js";
import type { NewCompany } from "../infrastructure/kysely/types.js";


const companyService = new CompanyService();
const userService = new UserService();

export const companyRouter = server.router(companyContract.contract, {
    index: {
        handler: async () => {
            const companies = await companyService.index()

            return {
                status: 200,
                body: {
                    data: companies
                }
            }
        }
    },
    show: {
        handler: async (input) => {
            const companyId = input.params.id;
            const company: CompanyWithUser | null = await companyService.show(Number(companyId))

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
                    data: company
                }
            }
        }
    },
    create: {
        handler: async (input) => {
            const companyParams = input.body;

            const manager = await userService.show(companyParams.managerId);
            if (!manager) {
                return {
                    status: 404,
                    body: {
                        message: 'User do not exist'
                    }
                }
            }

            const mappedCompanyParams: CompanyCreate = {
                name: companyParams.name,
                vatNumber: companyParams.vatNumber,
                headquartersAddress: companyParams.headquartersAddress,
                country: companyParams.country,
                companyType: companyParams.companyType,
                companySize: companyParams.companySize,
                companySector: companyParams.companySector,
            }

            const createdCompany = await companyService.create(mappedCompanyParams, manager.id)
            if (!createdCompany) {
                return {
                    status: 500,
                    body: {
                        message: 'Unexpexted error'
                    }
                }
            }

            return {
                status: 201,
                body: {
                    data: createdCompany
                }
            }

        }
    },
    update: {
        handler: async (input) => {
            const companyParams = input.body
            const companyId = input.params.id

            const updatedCompanyWithUsers = await companyService.update(Number(companyId), companyParams)
            if (!updatedCompanyWithUsers) {
                return {
                    status: 404,
                    body: {
                        message: 'Company not found'
                    }
                }
            }

            return {
                status: 200,
                body: {
                    data: updatedCompanyWithUsers
                }
            }
        }
    }
});
