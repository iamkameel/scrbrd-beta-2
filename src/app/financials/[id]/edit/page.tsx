import { fetchDocument } from '@/lib/firestore';
import { Transaction } from '@/types/firestore';
import { TransactionForm } from '@/components/financials/TransactionForm';
import { updateTransactionAction } from '@/app/actions/transactionActions';
import { notFound } from 'next/navigation';

interface EditTransactionPageProps {
  params: {
    id: string;
  };
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const transaction = await fetchDocument<Transaction>('transactions', params.id);

  if (!transaction) {
    notFound();
  }

  // Bind the transaction ID to the action
  const boundUpdateAction = updateTransactionAction.bind(null, params.id);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <TransactionForm
        mode="edit"
        transactionAction={boundUpdateAction}
        initialState={{}}
        initialData={{
          date: transaction.date,
          type: transaction.type as any,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status as any,
        }}
      />
    </div>
  );
}
