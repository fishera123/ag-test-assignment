import { User } from "modules/users/entities/user.entity";
import { AddTimeStampsMixin } from "orm/mixins/timestamp-entity.mixin";
import { AddUUIDMixin } from "orm/mixins/uuid-entity.mixin";
import { BaseEntity, Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class AccessToken extends AddUUIDMixin(AddTimeStampsMixin(BaseEntity)) {
  @Column()
  public token: string;

  @Column()
  public expiresAt: Date;

  @ManyToOne(() => User)
  public user: User;
}
