import React from "react";
import "./BakerDetails.scss";

const BakerDetails: React.FC<any> = ({ baker }) => {
  return (
    <div className="baker-details-container">
      <table className="baker-details">
        <tbody>
          <tr>
            <td className="baker-name"></td>
            <td className="baker-name">NAME</td>
            <td className="baker-yield">LIFETIME</td>
            <td className="baker-yield">YIELD</td>
            <td className="baker-yield">EFFICIENCY</td>
            <td className="baker-yield">LAST 10</td>
            <td className="baker-yield">FEE</td>
            <td className="baker-yield">SUPPORT</td>
            <td className="baker-yield">PROJECT</td>
            <td className="baker-yield">PAYOUTS</td>
            <td className="baker-yield">MIN DELEGATIONS AMOUNTS</td>
            <td className="baker-yield">TOTAL POINTS</td>
          </tr>
          <tr>
            <td>
              <img className="baker-image" src={baker.logo} />
            </td>
            <td className="baker-name">{baker.name}</td>
            <td className="baker-yield">{baker.lifetime}</td>
            <td className="baker-yield">{baker.yield}%</td>
            <td className="baker-yield">{baker.efficiency}% </td>
            <td className="baker-yield">{baker.efficiency_last10cycle}% </td>
            <td className="baker-yield">{baker.fee * 100}%</td>
            <td className="baker-yield">
              <a
                href={baker.support.url}
                title={baker.support.title}
                target="_blank"
              >
                <img src={baker.support.icon} />
              </a>
            </td>
            <td className="baker-yield">
              <a
                href={baker.projects[0].url}
                title={baker.projects[0].title}
                target="_blank"
              >
                <img src={baker.projects[0].icon} />
              </a>
            </td>

            <td className="baker-yield">{baker.payouts.title}</td>

            <td className="baker-yield">{baker.min_delegations_amount}</td>
            <td className="baker-yield">{baker.total_points}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BakerDetails;
