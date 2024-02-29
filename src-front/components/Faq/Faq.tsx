import "./Faq.scss";

type Question = {
  title: string;
  desc: string;
};

const questions: Question[] = [
  {
    title: "Why Do I Go Back a Step After Clicking the Synchronize Button ?",
    desc: `It's normal to experience this occasionally.Sometimes, issues can occur during synchronization. Simply retry the step, and everything should proceed smoothly.`,
  },
  {
    title: "Can I Delegate Only a Portion of My Tezos ?",
    desc: "No, unfortunately, that's not possible. When you delegate to a baker, all the Tezos in your wallet are delegated. This system is unique to Tezos. But don't worry! Bakers do not have direct access to your Tezos.",
  },
  {
    title: "Can I Delegate to Different Pools ?",
    desc: "No, you cannot. When you delegate, you are delegating your entire wallet, so it's not possible to use the same wallet to delegate to different pools.",
  },
];

export default function FAQ() {
  return (
    <div className="card card-default">
      <h2 className="h2">FAQ</h2>
      <dl className="questions">
        {questions.map((question: any) => (
          <details className="question" key={question.title}>
            <summary className="questionTitle">
              <span>{question.title}</span>
            </summary>
            <div className="questionDesc">{question.desc}</div>
          </details>
        ))}
      </dl>
    </div>
  );
}
