import { MdDelete, MdEdit } from "react-icons/md";
import axiosInstance from "../../../config/axiosConfig";
import { Link } from "react-router-dom";
import Modal from "../../core/modal";
import { useState } from "react";
import ConfirmDeleteModal from "../modals/confirm-delete-modal";
import { config } from "../../../config/config";

interface MatchProps {
  matchId: string;
  date: string;
  homeScore: number;
  awayScore: number;
  round: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
  isSelectedMatch: boolean;
  refetchMatches: () => void;
}

export default function MatchResult({
  matchId,
  date,
  homeScore,
  awayScore,
  round,
  penaltyHomeScore,
  penaltyAwayScore,
  isSelectedMatch,
  refetchMatches,
}: MatchProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleDeleteMatch = async (id: string) => {
    if (isDeleting) return;
    try {
      await axiosInstance.delete(`${config.server}/api/matches/${id}`, {
        withCredentials: true,
      });
      console.log("match deleted");
      refetchMatches();
    } catch (error) {
      console.error("Error deleting match:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    handleDeleteMatch(matchId);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div
        className={`mx-2 flex w-auto flex-row justify-between rounded-2xl border-2 border-solid border-gray-200 bg-gradient-to-br from-gray-100 to-white p-2 transition-all duration-300 ${isSelectedMatch ? "bg-gray-200 shadow-inner" : ""}`}
      >
        <div className="flex w-full flex-col">
          <div className="flex justify-center pt-4 font-semibold">
            Round {round}
          </div>
          <div className="flex flex-row items-center justify-around rounded-2xl pb-4">
            <div className="flex flex-col gap-4 text-center">
              <div className="font-normal">Home</div>
              <div className="text-2xl font-semibold">
                {homeScore} {penaltyHomeScore ? `(${penaltyHomeScore})` : ""}
              </div>
            </div>
            <div className="flex flex-col gap-4 text-center">
              <div className="font-normal">Away</div>
              <div className="text-2xl font-semibold">
                {awayScore} {penaltyAwayScore ? `(${penaltyAwayScore})` : ""}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between px-4 pt-2 text-center">
            <div className="flex-1 text-center text-sm font-light">
              {new Date(date)
                .toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                .replace(/(\d+)(?=\s)/, (d) => `${d}th`)}
            </div>
            <div className="m-4 flex w-fit flex-row items-center space-x-2 hover:cursor-pointer md:space-x-4">
              <Link to={`/edit-match/${matchId}`}>
                <MdEdit className="items-center text-lg text-black md:text-xl" />
              </Link>
              <MdDelete
                className="items-center text-lg text-black md:text-xl"
                onClick={handleDeleteClick}
              />
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Modal>
          <ConfirmDeleteModal
            onConfirm={confirmDelete}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
}
