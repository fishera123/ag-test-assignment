import { Newable } from "ts-essentials";
import { BaseEntity, PrimaryGeneratedColumn } from "typeorm";

export interface WithUUIDProps {
  id: string;
}
/**
 * A mixin factory to add uuid
 *
 * @param superClass - Base Class
 * @typeParam T - Model class
 */

export function AddUUIDMixin<T extends Newable<BaseEntity>>(superClass: T): T & Newable<WithUUIDProps> {
  class MixedEntity extends superClass implements WithUUIDProps {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;
  }

  return MixedEntity;
}
