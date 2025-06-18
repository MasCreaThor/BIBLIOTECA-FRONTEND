export interface PersonLoanSummary {
  person: {
    _id: string;
    name: string;
    documentNumber: string;
    personType: string;
  };
  loans: {
    _id: string;
    resource: {
      title: string;
      isbn?: string;
    };
    loanDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: string;
    observations?: string;
  }[];
  summary: {
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    returnedLoans: number;
    lostLoans: number;
  };
  personStatus: 'up_to_date' | 'not_up_to_date';
}

export enum LoanStatusFilter {
  ACTIVE = 'active',
  OVERDUE = 'overdue',
  RETURNED = 'returned',
  LOST = 'lost',
}

export interface PersonLoansQuery {
  search?: string;
  status?: LoanStatusFilter[];
  year?: string;
}

export interface UpdateLoanStatusRequest {
  loanId: string;
  status: LoanStatusFilter;
  observations?: string;
}

export interface UpdateMultipleLoanStatusRequest {
  loanIds: string[];
  status: LoanStatusFilter;
  observations?: string;
} 