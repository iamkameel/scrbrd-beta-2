import { TransactionForm } from '@/components/financials/TransactionForm';
import { createTransactionAction } from '@/app/actions/transactionActions';

export default function AddTransactionPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <TransactionForm
        mode="create"
        transactionAction={createTransactionAction}
        initialState={{}}
      />
    </div>
  );
}
