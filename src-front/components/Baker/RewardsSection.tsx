import React, { useEffect } from "react";
import "./BakerDetails.scss";
import axios from "axios";
import { KEEPIX_API_URL, PLUGIN_API_SUBPATH } from "../../constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const RewardsSection: React.FC<any> = ({
  baker,
  walletBalance,
  StatusData,
}) => {
  const postDelegatingBakeryQuery = useMutation({
    mutationFn: async () => {
      const query = await axios.post(
        `${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/delegating-bakery`,
        {
          Address: baker.address,
        }
      );
      if (
        query?.data?.result !== undefined &&
        query?.data?.result !== null &&
        !query?.data?.result.contains("failed")
      ) {
        toast.success("Wallet delegated successfully to a bakery !");
      } else {
        toast.error("Delegating error !");
      }
    },
    onError: (error: any) => {},
  });

  const postWithdrawBakeryQuery = useMutation({
    mutationFn: async () => {
      const query = await axios.post(
        `${KEEPIX_API_URL}${PLUGIN_API_SUBPATH}/withdraw-bakery`
      );
      if (
        query?.data?.result !== undefined &&
        query?.data?.result !== null &&
        !query?.data?.result.contains("failed")
      ) {
        toast.success("Withdraw success !");
      } else {
        toast.error("Withdraw error !");
      }
    },
    onError: (error: any) => {},
  });

  const isDelegated =
    StatusData?.IsDelegated !== undefined && StatusData?.IsDelegated
      ? true
      : false;

  return (
    <div className="rewards-container">
      {isDelegated ? (
        <>
          <div className="reward-block-deleg">
            Date of Delegation Start:{" "}
            {StatusData?.DelegatedDate
              ? new Date(StatusData.DelegatedDate).toLocaleDateString()
              : "Not delegated"}
          </div>
          <div className="reward-block-deleg">
            Rewards:{" "}
            {StatusData?.DelegatedBalance && walletBalance.result
              ? Number(
                  (walletBalance.result - StatusData.DelegatedBalance).toFixed(
                    2
                  )
                )
              : "N/A"}{" "}
            XTZ
          </div>
        </>
      ) : (
        ""
      )}

      <div className="reward-block">
        Cycle Reward:{" "}
        {((walletBalance.result * baker.yield) / 100 / 12 / (30 / 2.8)).toFixed(
          2
        )}{" "}
        XTZ
      </div>
      <div className="reward-block">
        Monthly Reward:{" "}
        {((walletBalance.result * baker.yield) / 100 / 12).toFixed(2)} XTZ
      </div>
      <div className="reward-block">
        Yearly Reward: {((walletBalance.result * baker.yield) / 100).toFixed(2)}{" "}
        XTZ
      </div>
      <button
        className={`delegate-button ${
          postDelegatingBakeryQuery.isPending ||
          postWithdrawBakeryQuery.isPending
            ? "loading"
            : ""
        }`}
        onClick={() => {
          if (isDelegated) {
            postWithdrawBakeryQuery.mutate();
          } else {
            postDelegatingBakeryQuery.mutate();
          }
        }}
        disabled={
          postDelegatingBakeryQuery.isPending ||
          postWithdrawBakeryQuery.isPending
        }
      >
        {postWithdrawBakeryQuery.isPending ||
        postDelegatingBakeryQuery.isPending
          ? "LOADING ..."
          : isDelegated
          ? "WITHDRAW"
          : "DELEGATE"}
      </button>
    </div>
  );
};

export default RewardsSection;
