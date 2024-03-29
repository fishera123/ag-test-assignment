import * as bcrypt from "bcrypt";
import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { CreateUserInputDto } from "./dto/create-user.input.dto";
import { User } from "./entities/user.entity";
import dataSource from "orm/orm.config";
import { GoogleMapsService } from "modules/google-maps/google-maps.service";

export class UsersService {
  private readonly usersRepository: Repository<User>;
  private readonly googleMapsProvider: GoogleMapsService;

  constructor() {
    this.usersRepository = dataSource.getRepository(User);
    this.googleMapsProvider = new GoogleMapsService();
  }

  public async createUser(data: CreateUserInputDto): Promise<User> {
    const { email, password, address } = data;

    const existingUser = await this.findOneBy({ email: email });
    if (existingUser) throw new UnprocessableEntityError("A user for the email already exists");

    const hashedPassword = await this.hashPassword(password);
    const coordinates = await this.googleMapsProvider.getCoordinates(address);
    const userData: DeepPartial<User> = { email, hashedPassword, address, coordinates };

    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  public async findOneBy(param: FindOptionsWhere<User>): Promise<User | null> {
    return this.usersRepository.findOneBy({ ...param });
  }

  private async hashPassword(password: string, saltRounds = config.SALT_ROUNDS): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);

    return bcrypt.hash(password, salt);
  }
}
