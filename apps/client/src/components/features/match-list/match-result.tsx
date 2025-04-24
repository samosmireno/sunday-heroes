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
      <div className="relative mb-3 rounded-lg border-2 border-accent bg-secondary p-3 text-center shadow-inner sm:mb-4 sm:p-4 md:mb-6 md:p-6">
        <div className="flex w-full flex-col">
          <div className="mb-2 text-xs text-accent sm:mb-4 sm:text-sm">
            Round {round}
          </div>
          <div className="mb-3 flex items-center justify-center gap-4 text-2xl font-bold sm:mb-4 sm:text-3xl md:mb-6 md:text-4xl">
            <div className="flex flex-col gap-2 text-center sm:gap-3 md:gap-4">
              <div className="mx-2 text-xs sm:mx-4 sm:text-sm md:text-base">
                Home
              </div>
              <div className="min-w-fit rounded border-2 border-accent bg-bg px-3 py-2 shadow-inner sm:px-4 sm:py-3 md:px-6">
                {homeScore} {penaltyHomeScore ? `(${penaltyHomeScore})` : ""}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-center sm:gap-3 md:gap-4">
              <div className="mx-2 text-xs sm:mx-4 sm:text-sm md:text-base">
                Away
              </div>
              <div className="min-w-fit rounded border-2 border-accent bg-bg px-3 py-2 shadow-inner sm:px-4 sm:py-3 md:px-6">
                {awayScore} {penaltyAwayScore ? `(${penaltyAwayScore})` : ""}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between px-2 pt-1 text-center sm:px-4 sm:pt-2">
            <div className="text-xs text-accent sm:text-sm">
              {new Date(date)
                .toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                .replace(/(\d+)(?=\s)/, (d) => `${d}th`)}
            </div>
            <div className="mt-2 flex justify-center gap-4 sm:mt-3 sm:gap-6 md:mt-4">
              <Link to={`/edit-match/${matchId}`}>
                <MdEdit className="text-lg text-accent sm:text-xl" />
              </Link>
              <MdDelete
                className="text-lg text-accent hover:cursor-pointer sm:text-xl"
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
