import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {plainToClass} from "class-transformer";

// This is a standard TypeORM entity declaration
@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  static fromJson (json: User) {
    return plainToClass(User, json);
  }
}
