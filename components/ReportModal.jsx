"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const reportReasons = [
  {
    id: "inappropriate",
    title: "Inappropriate Content",
    description: "Contains offensive, explicit, or inappropriate material",
  },
  {
    id: "spam",
    title: "Spam",
    description: "Irrelevant or promotional content",
  },
  {
    id: "harassment",
    title: "Harassment",
    description: "Contains personal attacks or harassment",
  },
  {
    id: "misinformation",
    title: "Misinformation",
    description: "Contains false or misleading medical information",
  },
  {
    id: "other",
    title: "Other",
    description: "Other reason not listed above",
  },
];

const ReportModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [selectedReason, setSelectedReason] = useState(reportReasons[0]);
  const [additionalDetails, setAdditionalDetails] = useState("");

  const handleSubmit = () => {
    onSubmit({
      reason: selectedReason.id,
      details: additionalDetails,
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                >
                  <div className="flex items-center space-x-2">
                    <FaExclamationTriangle className="text-yellow-500" />
                    <span>Report Comment</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </Dialog.Title>

                <div className="mt-4">
                  <RadioGroup value={selectedReason} onChange={setSelectedReason}>
                    <RadioGroup.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select a reason for reporting
                    </RadioGroup.Label>

                    <div className="mt-2 space-y-2">
                      {reportReasons.map((reason) => (
                        <RadioGroup.Option
                          key={reason.id}
                          value={reason}
                          className={({ checked }) =>
                            `${
                              checked
                                ? "bg-purple-50 dark:bg-purple-900/50 border-purple-500"
                                : "border-gray-200 dark:border-gray-700"
                            }
                            relative flex cursor-pointer rounded-lg px-4 py-3 border focus:outline-none`
                          }
                        >
                          {({ checked }) => (
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label
                                    as="p"
                                    className={`font-medium ${
                                      checked
                                        ? "text-purple-900 dark:text-purple-100"
                                        : "text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    {reason.title}
                                  </RadioGroup.Label>
                                  <RadioGroup.Description
                                    as="span"
                                    className={`inline ${
                                      checked
                                        ? "text-purple-700 dark:text-purple-300"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {reason.description}
                                  </RadioGroup.Description>
                                </div>
                              </div>
                              {checked && (
                                <div className="shrink-0 text-purple-500">
                                  <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="mt-4">
                    <label
                      htmlFor="details"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Additional Details (Optional)
                    </label>
                    <textarea
                      id="details"
                      rows={3}
                      className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:ring-purple-500"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      placeholder="Provide any additional context..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReportModal;
