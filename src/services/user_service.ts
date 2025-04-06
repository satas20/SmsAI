import { User } from '../models/user';
import { UserSubscription } from '../models/user_subscription';
export class UserService {
  public async createNewUser(phoneNumber: string) {
    const user = User.create({
      phoneNumber,
    });
    const userId = (await user).getDataValue('id');
    const userSubscription = await UserSubscription.create({
      userId: userId,
      subscriptionId: 'default-subscription-id', // Replace with actual default subscription ID
      startDate: new Date(),
    });
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await User.findOne({
      where: { id },
    });
    return user;
  }
  public async findUserByPhoneNumber(
    phoneNumber: string,
  ): Promise<User | null> {
    const user = await User.findOne({
      where: { phoneNumber },
    });
    return user;
  }
}
