import { User } from "modules/users/entities/user.entity";
import { AddTimeStampsMixin } from "orm/mixins/timestamp-entity.mixin";
import { AddUUIDMixin } from "orm/mixins/uuid-entity.mixin";
import { BaseEntity, Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Farm extends AddUUIDMixin(AddTimeStampsMixin(BaseEntity)) {
  @Column({ unique: true })
  public name: string;

  @Column({ type: "float" })
  public yield: number;

  @Column({ type: "float" })
  public size: number;

  @Column()
  public address: string;

  @ManyToOne(() => User)
  public owner: User;

  @Column()
  public coordinates: string;

  @Column()
  public drivingDistance: number;

  constructor(partial: Partial<Farm>) {
    super();
    Object.assign(this, partial);
  }
}
