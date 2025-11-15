import { Product } from "src/products/entities/product.entity";
import { Subcategory } from "src/subcategories/entities/subcategory.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    imageUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: true })
    isActive: boolean;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Subcategory, subcategory => subcategory.category)
    subcategories: Subcategory[];

    @OneToMany(() => Product, product => product.category)
    products: Product[];
}
