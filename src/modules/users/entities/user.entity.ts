import { AddTimeStampsMixin } from "orm/mixins/timestamp-entity.mixin";
import { AddUUIDMixin } from "orm/mixins/uuid-entity.mixin";
import { BaseEntity, Column, Entity } from "typeorm";

@Entity()
export class User extends AddUUIDMixin(AddTimeStampsMixin(BaseEntity)) {
  @Column({ unique: true })
  public email: string;

  @Column()
  public hashedPassword: string;

  @Column()
  public address: string;

  @Column()
  public coordinates: string;

  constructor(data: Partial<User>) {
    super();
    Object.assign(this, data);
  }
}
