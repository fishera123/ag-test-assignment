import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Newable } from "ts-essentials";

export interface WithTimeStampProps {
  createdAt: Date;
  updatedAt: Date;
}
/**
 * A mixin factory to add timestamps createdAt, updatedAt
 *
 * @param superClass - Base Class
 * @typeParam T - Entity class
 */
export function AddTimeStampsMixin<T extends Newable<BaseEntity>>(superClass: T): T & Newable<WithTimeStampProps> {
  class MixedEntity extends superClass implements WithTimeStampProps {
    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;
  }

  return MixedEntity;
}
