import { Trip } from '../entities/trip';
import { Expense } from '../entities/expense';
import { Wallet, WalletMovement } from '../entities/wallet';
import { Settlement } from '../entities/settlement';
import { Exchange } from '../entities/exchange';

export interface ITripRepository {
  getById(id: string): Promise<Trip | null>;
  getAll(): Promise<Trip[]>;
  save(trip: Trip): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IExpenseRepository {
  getById(id: string): Promise<Expense | null>;
  getByTripId(tripId: string): Promise<Expense[]>;
  save(expense: Expense): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IWalletRepository {
  getById(id: string): Promise<Wallet | null>;
  getByTripId(tripId: string): Promise<Wallet[]>;
  save(wallet: Wallet): Promise<void>;
  delete(id: string): Promise<void>;
  saveMovement(movement: WalletMovement): Promise<void>;
  getMovementsByWalletId(walletId: string): Promise<WalletMovement[]>;
}

export interface ISettlementRepository {
  getById(id: string): Promise<Settlement | null>;
  getByTripId(tripId: string): Promise<Settlement[]>;
  save(settlement: Settlement): Promise<void>;
}

export interface IExchangeRepository {
  getById(id: string): Promise<Exchange | null>;
  getByTripId(tripId: string): Promise<Exchange[]>;
  save(exchange: Exchange): Promise<void>;
}
