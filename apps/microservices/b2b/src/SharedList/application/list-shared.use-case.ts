import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../User/domain/user.repository';
import { ListSharedRepository } from '../../SharedList/domain/list-shared.repository';
import { ListShared } from '../domain/list-shared.entity';
import { ListRepository } from '../../List/domain/list.repository';
import { User } from '../../User/domain/user';

@Injectable()
export class SharedListService {
  constructor(
    private readonly sharedListRepository: ListSharedRepository,
    private readonly listRepository: ListRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createSharedList(
    email: string,
    listId: number,
    sharedList: ListShared,
  ): Promise<ListShared> {
    const isAdmin = await this.checkUserIsListAdmin(email, listId, 'clientstore-DevCo');
    if (!isAdmin) {
      throw new Error('Usuario no autorizado para crear una lista compartida');
    }

    const createdSharedList = await this.sharedListRepository.create(
      sharedList,
    );
    return createdSharedList;
  }

  async updateSharedList(
    email: string,
    listId: number,
    sharedList: ListShared,
  ): Promise<ListShared> {
    const isAdmin = await this.checkUserIsListAdmin(email, listId, 'clientstore-DevCo');
    if (!isAdmin) {
      throw new Error(
        'Usuario no autorizado para actualizar una lista compartida',
      );
    }

    // Lógica para actualizar la lista compartida
    const updatedSharedList = await this.sharedListRepository.update(
      listId,
      sharedList,
    );
    return updatedSharedList;
  }

  async deleteSharedList(email: string, listId: number): Promise<void> {
    const isAdmin = await this.checkUserIsListAdmin(email, listId, 'clientstore-DevCo');
    if (!isAdmin) {
      throw new Error(
        'Usuario no autorizado para eliminar una lista compartida',
      );
    }

    // Lógica para eliminar la lista compartida
    await this.sharedListRepository.delete(listId);
  }

  private async checkUserIsListAdmin(
    email: string,
    listId: number,
    db: string,
  ): Promise<boolean> {
    const promises = await Promise.allSettled([
      this.userRepository.getUserByEmail(email, db),
      this.userRepository.getUserAdminOrg(email),
      this.listRepository.findListById(listId),
    ]);

    const [userPromise, userAdminOrgsPromise, listPromise] = promises;

    const validatePromise = (promise) => {
      if (promise.status == 'fulfilled' && promise.value.isSuccess) {
        return promise.value.getValue();
      }
      return null;
    };

    const user = validatePromise(userPromise);
    const userAdminOrgs = validatePromise(userAdminOrgsPromise);
    const list = validatePromise(listPromise);

    return user && list && userAdminOrgs.some((org) => org.listId === listId);
  }
}
