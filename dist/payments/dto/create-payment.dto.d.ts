declare class CreateUserDto {
    email: string;
    name: string;
    rut: string;
    address: string;
    phone: string;
}
export declare class CreatePaymentDto {
    user: CreateUserDto;
    raffleId: number;
    tickets: number;
}
export {};
