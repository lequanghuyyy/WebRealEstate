import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Reuse the Transaction interface from the component
export interface Transaction {
  id?: string | number;
  type: string;
  amount: number;
  commission: number;
  status: string;
  paymentStatus: string;
  date: string;
  property: {
    id: string | number;
    title: string;
    image: string;
  };
  client: {
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;
  
  // Mock transactions data (this would come from API in a real app)
  private mockTransactions: Transaction[] = [
    {
      id: 'TX001',
      property: {
        id: 'P001',
        title: 'Vinhomes Ocean Park Apartment',
        image: 'assets/images/properties/property1.jpg'
      },
      client: {
        name: 'John Smith',
        email: 'johnsmith@gmail.com'
      },
      type: 'sale',
      amount: 2500000000,
      commission: 75000000,
      status: 'completed',
      paymentStatus: 'paid',
      date: '2023-06-15'
    },
    {
      id: 'TX002',
      property: {
        id: 'P002',
        title: 'Phu My Hung Townhouse',
        image: 'assets/images/properties/property2.jpg'
      },
      client: {
        name: 'Mary Johnson',
        email: 'mary@gmail.com'
      },
      type: 'rent',
      amount: 15000000,
      commission: 7500000,
      status: 'pending',
      paymentStatus: 'pending',
      date: '2023-07-02'
    },
    {
      id: 'TX003',
      property: {
        id: 'P003',
        title: 'Da Lat Villa',
        image: 'assets/images/properties/property3.jpg'
      },
      client: {
        name: 'David Williams',
        email: 'david@gmail.com'
      },
      type: 'sale',
      amount: 5800000000,
      commission: 174000000,
      status: 'completed',
      paymentStatus: 'paid',
      date: '2023-05-20'
    },
    {
      id: 'TX004',
      property: {
        id: 'P004',
        title: 'The Marq Apartment',
        image: 'assets/images/properties/property4.jpg'
      },
      client: {
        name: 'Patricia Brown',
        email: 'patricia@gmail.com'
      },
      type: 'rent',
      amount: 25000000,
      commission: 12500000,
      status: 'cancelled',
      paymentStatus: 'refunded',
      date: '2023-07-10'
    },
    {
      id: 'TX005',
      property: {
        id: 'P005',
        title: 'Hang Bong Shophouse',
        image: 'assets/images/properties/property5.jpg'
      },
      client: {
        name: 'Henry Wilson',
        email: 'henry@gmail.com'
      },
      type: 'sale',
      amount: 12000000000,
      commission: 360000000,
      status: 'completed',
      paymentStatus: 'paid',
      date: '2023-04-25'
    },
    {
      id: 'TX006',
      property: {
        id: 'P006',
        title: 'Masteri An Phu Apartment',
        image: 'assets/images/properties/property6.jpg'
      },
      client: {
        name: 'Victoria Jones',
        email: 'victoria@gmail.com'
      },
      type: 'rent',
      amount: 18000000,
      commission: 9000000,
      status: 'pending',
      paymentStatus: 'pending',
      date: '2023-07-15'
    },
    {
      id: 'TX007',
      property: {
        id: 'P007',
        title: 'Ecopark Villa',
        image: 'assets/images/properties/property7.jpg'
      },
      client: {
        name: 'Michael Davis',
        email: 'michael@gmail.com'
      },
      type: 'sale',
      amount: 8500000000,
      commission: 255000000,
      status: 'completed',
      paymentStatus: 'paid',
      date: '2023-03-12'
    },
    {
      id: 'TX008',
      property: {
        id: 'P008',
        title: 'Estella Heights Apartment',
        image: 'assets/images/properties/property8.jpg'
      },
      client: {
        name: 'Elizabeth Taylor',
        email: 'elizabeth@gmail.com'
      },
      type: 'rent',
      amount: 30000000,
      commission: 15000000,
      status: 'completed',
      paymentStatus: 'paid',
      date: '2023-06-01'
    },
    {
      id: 'TX009',
      property: {
        id: 'P009',
        title: 'Lakeview City Townhouse',
        image: 'assets/images/properties/property9.jpg'
      },
      client: {
        name: 'Robert Martin',
        email: 'robert@gmail.com'
      },
      type: 'sale',
      amount: 9500000000,
      commission: 285000000,
      status: 'pending',
      paymentStatus: 'pending',
      date: '2023-07-18'
    },
    {
      id: 'TX010',
      property: {
        id: 'P010',
        title: 'FLC Sam Son Villa',
        image: 'assets/images/properties/property10.jpg'
      },
      client: {
        name: 'Karen Thompson',
        email: 'karen@gmail.com'
      },
      type: 'rent',
      amount: 45000000,
      commission: 22500000,
      status: 'cancelled',
      paymentStatus: 'refunded',
      date: '2023-05-05'
    },
    {
      id: 'TX011',
      property: {
        id: 'P011',
        title: 'D\'Capitale Apartment',
        image: 'assets/images/properties/property11.jpg'
      },
      client: {
        name: 'Daniel Clark',
        email: 'daniel@gmail.com'
      },
      type: 'sale',
      amount: 3200000000,
      commission: 96000000,
      status: 'completed',
      paymentStatus: 'paid',
      date: '2023-02-28'
    },
    {
      id: 'TX012',
      property: {
        id: 'P012',
        title: 'Vinhomes Smart City Shophouse',
        image: 'assets/images/properties/property12.jpg'
      },
      client: {
        name: 'Helen Garcia',
        email: 'helen@gmail.com'
      },
      type: 'rent',
      amount: 35000000,
      commission: 17500000,
      status: 'pending',
      paymentStatus: 'pending',
      date: '2023-07-20'
    }
  ];

  constructor() {}

  // Get all transactions (simulating API call with delay)
  getTransactions(): Observable<Transaction[]> {
    return of(this.mockTransactions).pipe(
      delay(800) // Simulate network delay
    );
  }

  // Get a transaction by ID
  getTransactionById(id: string): Observable<Transaction | undefined> {
    const transaction = this.mockTransactions.find(t => t.id === id);
    return of(transaction).pipe(
      delay(300)
    );
  }

  // Add a new transaction
  addTransaction(transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    // Generate a new ID
    const newId = 'TX' + (this.mockTransactions.length + 1).toString().padStart(3, '0');
    
    const newTransaction: Transaction = {
      ...transaction,
      id: newId
    };
    
    // Add to mock data
    this.mockTransactions.push(newTransaction);
    
    return of(newTransaction).pipe(
      delay(500)
    );
  }

  // Update an existing transaction
  updateTransaction(transaction: Transaction): Observable<Transaction> {
    const index = this.mockTransactions.findIndex(t => t.id === transaction.id);
    
    if (index !== -1) {
      this.mockTransactions[index] = transaction;
      return of(transaction).pipe(
        delay(500)
      );
    }
    
    return of(transaction).pipe(
      delay(500)
    );
  }

  // Delete a transaction
  deleteTransaction(id: string): Observable<boolean> {
    const index = this.mockTransactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
      this.mockTransactions.splice(index, 1);
      return of(true).pipe(
        delay(500)
      );
    }
    
    return of(false).pipe(
      delay(500)
    );
  }
} 