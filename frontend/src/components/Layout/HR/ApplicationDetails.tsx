/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Link as ChakraLink,
  Select,
  useToast,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import {
  FaCheck,
  FaClock,
  FaDollarSign,
  FaDownload,
  FaEnvelope,
  FaMapPin,
  FaPhone,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../shared/PageHeader';
import { StatusBadge } from '../../ui/StatusBadge';
import { applicationService } from '../../../services/applicationService';
import { formatDate } from '../../../utils';
import type { Application } from '../../../types';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { ErrorAlert } from '../../ui/ErrorAlert';
import { staticTestCases } from '../../../constants';

// Helper to extract AI result safely

export const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  console.log(application);

  // Decision states
  const [cvDecision, setCvDecision] = useState('');
  const [techInterviewDecision, setTechInterviewDecision] = useState('');
  const [hrInterviewDecision, setHrInterviewDecision] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Scheduling states
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewInstructions, setInterviewInstructions] = useState('');
  const [sendingAssessment, setSendingAssessment] = useState(false);
  const [hrInterviewDate, setHrInterviewDate] = useState('');
  const [hrInterviewTime, setHrInterviewTime] = useState('');
  const [hrInterviewInstructions, setHrInterviewInstructions] = useState('');
  const [hrMeetLink, setHrMeetLink] = useState('');
  const [sendingHRInterview, setSendingHRInterview] = useState(false);


  // AI Screening Result
  const [aiScreeningResult, setAiScreeningResult] = useState<{
    decision: string;
    feedback: string;
    score: number;
  } | null>(null);

  const [technicalAssessment, setTechnicalAssessment] = useState<{
    answers: { [key: number]: string };
    testResults: { [key: number]: any[] };
    timeSpent: number;
    completedAt: string;
  } | null>(null);

  // Fetch application details
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!id) {
        setError('Application ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await applicationService.getApplicationById(id);
        console.log(data);
        setApplication(data);

        if (Array.isArray(data.aiScreenings) && data.aiScreenings.length > 0) {
          const latest = data.aiScreenings[data.aiScreenings.length - 1];
          setAiScreeningResult({
            decision: latest.decision,
            feedback: latest.feedback,
            score: latest.score,
          });
        }

        // Fetch technical assessment
        try {
          const response = await applicationService.getTechnicalAssessment(id);
          console.log(response.data.assessment);
          setTechnicalAssessment(response?.data?.assessment);
        } catch {
          console.log('No technical assessment found for this candidate');
        }

        // Initialize decision states
        setCvDecision(data.cvStatus === 'Pending' ? '' : data.cvStatus);
        setTechInterviewDecision(
          data.techStatus === 'Pending' ? '' : data.techStatus
        );
        setHrInterviewDecision(
          data.hrStatus === 'Pending' ? '' : data.hrStatus
        );
      } catch (err: any) {
        if (err.response?.status === 404) setError('Candidate not found');
        else if (err.response?.status === 400) setError('Invalid candidate ID');
        else
          setError(
            err.response?.data?.message || 'Failed to fetch application details'
          );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const handleSendTechnicalAssessment = async () => {
    if (!application || !interviewDate || !interviewTime) {
      toast({
        title: 'Missing Information',
        description: 'Please provide interview date and time',
        status: 'warning',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      return;
    }

    try {
      setSendingAssessment(true);

      console.log({interviewDate,interviewTime});

      const data = await applicationService.sendTechnicalAssessmentEmail(
        application.id,
        {
          interviewDate,
          interviewTime,
          instructions: interviewInstructions,
        }
      );
      console.log(data);

      toast({
        title: 'Technical Assessment Sent',
        description:
          'Interview scheduled and assessment email sent to candidate',
        status: 'success',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });

      // Refresh application data
      const updatedApplication = await applicationService.getApplicationById(
        application.id
      );
      setApplication(updatedApplication);
    } catch (error: any) {
      console.error('Failed to send technical assessment:', error);
      toast({
        title: 'Failed to Send Assessment',
        description: error.message || 'Please try again or contact support',
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });
    } finally {
      setSendingAssessment(false);
    }
  };

  const handleApproveCVAndSchedule = async () => {
    if (!application) return;

    try {
      console.log(application.id);

      const data = await applicationService.approveCVAndSchedule(
        application.id
      );
      console.log(data);

      toast({
        title: 'CV Approved Successfully',
        description:
          'Congratulations email sent to candidate. You can now schedule the technical interview.',
        status: 'success',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });

      setApplication((prev) =>
        prev
          ? { ...prev, cvStatus: 'Passed', currentRound: 'Technical Interview' }
          : null
      );
    } catch (error: any) {
      toast({
        title: 'Failed to Approve CV',
        description: error.message || 'Please try again or contact support',
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });
    }
  };

  const handleApproveTechnicalInterview = async () => {
    if (!application) return;

    try {
      setProcessing(true);

      await applicationService.sendTechnicalInterviewPassedEmail(
        application.id,
        {
          interviewDate, // the date you scheduled
          interviewTime, // the time you scheduled
        }
      );

      toast({
        title: 'Technical Interview Approved',
        description: 'Candidate notified for HR round successfully.',
        status: 'success',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              techStatus: 'Passed',
              currentRound: 'HR Interview',
              interviewDate,
              interviewTime,
            }
          : null
      );
    } catch (error: any) {
      toast({
        title: 'Failed to Approve Technical Interview',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendHRInterview = async () => {
    if (!application || !hrInterviewDate || !hrInterviewTime) {
      toast({
        title: 'Missing Information',
        description: 'Please provide interview date and time',
        status: 'warning',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      return;
    }

    try {
      setSendingHRInterview(true);

      const data = await applicationService.sendHRInterviewEmail(
        application.id,
        {
          interviewDate: hrInterviewDate,
          interviewTime: hrInterviewTime,
          instructions: hrInterviewInstructions,
          meetLink: hrMeetLink,
        }
      );
      console.log(data);

      toast({
        title: 'HR Interview Scheduled',
        description: 'Interview scheduled and email sent to candidate and HR',
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });

      // Reset form
      setHrInterviewDate('');
      setHrInterviewTime('');
      setHrInterviewInstructions('');
      setHrMeetLink('');

      // Refresh application data
      if (application?.id) {
        fetchApplication(application.id);
      }
    } catch (error) {
      console.error('Error scheduling HR interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule HR interview. Please try again.',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    } finally {
      setSendingHRInterview(false);
    }
  };

  const handleApproveHRInterview = async () => {
    if (!application) return;

    try {
      setProcessing(true);

      // Send HR interview passed email
      const data = await applicationService.sendHRInterviewPassedEmail(
        application.id
      );
      console.log('dat>>>>>>a', data);

      toast({
        title: 'HR Interview Approved',
        description: 'Candidate has been approved and application completed!',
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              hrStatus: 'Passed',
              currentRound: 'Completed',
              overallStatus: 'Selected',
            }
          : null
      );
      fetchApplication(application.id);
    } catch (error) {
      console.error('Error approving HR interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve HR interview. Please try again.',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecision = async (round: string) => {
    if (!application) return;

    const updateData: any = {};
    let nextRound: Application['currentRound'] | undefined;
    let currentDecision = '';

    switch (round) {
      case 'cv':
        currentDecision = cvDecision;
        if (!currentDecision) return;
        updateData.cvStatus = currentDecision;
        updateData.screeningCompletedAt = new Date().toISOString();
        if (currentDecision === 'Passed') {
          nextRound = 'Technical Interview';
          updateData.interviewDate = interviewDate;
          updateData.interviewTime = interviewTime;
        } else {
          updateData.rejectionReason = rejectionReason;
          updateData.overallStatus = 'Rejected';
        }
        break;
      case 'tech':
        currentDecision = techInterviewDecision;
        if (!currentDecision) return;
        updateData.techStatus = currentDecision;
        if (currentDecision === 'Passed') {
          nextRound = 'HR Interview';
          updateData.interviewDate = interviewDate;
          updateData.interviewTime = interviewTime;
        } else {
          updateData.rejectionReason = rejectionReason;
          updateData.overallStatus = 'Rejected';
        }
        break;
      case 'hr':
        currentDecision = hrInterviewDecision;
        if (!currentDecision) return;
        updateData.hrStatus = currentDecision;
        if (currentDecision === 'Passed') {
          nextRound = 'Completed';
          updateData.overallStatus = 'Selected';
        } else {
          updateData.rejectionReason = rejectionReason;
          updateData.overallStatus = 'Rejected';
        }
        break;
      default:
        return;
    }

    if (nextRound) updateData.currentRound = nextRound;

    try {
      setProcessing(true);

      if (currentDecision === 'Failed') {
        switch (round) {
          case 'cv':
            await applicationService.sendCVRejectionEmail(
              application.id,
              rejectionReason
            );
            break;
          case 'tech':
            await applicationService.sendTechnicalRejectionEmail(
              application.id,
              rejectionReason
            );
            break;
          case 'hr':
            await applicationService.sendHRRejectionEmail(
              application.id,
              rejectionReason
            );
            break;
        }
      } else {
        // Update application for passed decisions
        await applicationService.updateApplication(application.id, updateData);
      }

      toast({
        title: `Application ${currentDecision}`,
        description:
          currentDecision === 'Failed'
            ? `${round.toUpperCase()} rejection email sent to candidate`
            : `${round.toUpperCase()} decision processed successfully`,
        status: currentDecision === 'Passed' ? 'success' : 'info',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });

      navigate('/hr/dashboard');
    } catch (error: any) {
      toast({
        title: 'Failed to process decision',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (aiScreeningResult) {
      localStorage.setItem(
        `aiScreeningResult_${id}`,
        JSON.stringify(aiScreeningResult)
      );
    }
  }, [aiScreeningResult, id]);

  const getPageTitle = (currentRound: Application['currentRound']) => {
    switch (currentRound) {
      case 'CV Screening':
        return 'CV Screening';
      case 'Technical Interview':
        return 'Technical Interview Review';
      case 'HR Interview':
        return 'HR Interview Review';
      case 'Completed':
        return 'Application Completed';
      default:
        return 'Application Details';
    }
  };

  const fetchApplication = async (appId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getApplicationById(appId);
      console.log(data);
      setApplication(data);
    } catch (err: any) {
      if (err.response?.status === 404) setError('Candidate not found');
      else if (err.response?.status === 400) setError('Invalid candidate ID');
      else
        setError(
          err.response?.data?.message || 'Failed to fetch application details'
        );
    } finally {
      setLoading(false);
    }
  };

  const renderDecisionCard = (
    roundName: string,
    currentStatus: string,
    decisionState: string,
    setDecisionState: (value: string) => void,
    onProcessDecision: () => Promise<void>,
    rejectionReason: string,
    setRejectionReason: (value: string) => void,
    processing: boolean
  ) => {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">{roundName} Decision</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Select
              placeholder="Select decision"
              value={decisionState}
              onChange={(e) => setDecisionState(e.target.value)}
            >
              <option value="Passed">Approve - Move to Next Stage</option>
              <option value="Failed">Reject - Not Qualified</option>
            </Select>

            {decisionState === 'Failed' && (
              <Select
                placeholder="Select rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="insufficient_experience">
                  Insufficient Experience
                </option>
                <option value="missing_skills">Missing Required Skills</option>
                <option value="education_requirements">
                  Education Requirements Not Met
                </option>
                <option value="overqualified">
                  Overqualified for Position
                </option>
                <option value="other">Other</option>
              </Select>
            )}

            <Button
              colorScheme={decisionState === 'Passed' ? 'green' : 'red'}
              leftIcon={decisionState === 'Passed' ? <FaCheck /> : <FaTimes />}
              onClick={onProcessDecision}
              isDisabled={
                !decisionState ||
                (decisionState === 'Failed' && !rejectionReason)
              }
              isLoading={processing}
              w="full"
            >
              {decisionState === 'Passed' ? 'Approve' : 'Reject & Send Email'}
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  if (loading)
    return <LoadingSpinner message="Loading application details..." />;

  if (error)
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="6xl" py={8}>
          <ErrorAlert
            message={error}
            onRetry={() => window.location.reload()}
          />
          <Button mt={4} onClick={() => navigate('/hr/dashboard')}>
            Back to Dashboard
          </Button>
        </Container>
      </Box>
    );

  if (!application) return <LoadingSpinner message="Application not found" />;

  const totalSeconds = Math.floor(technicalAssessment.timeSpent);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${minutes} min ${seconds} sec`;

  return (
    <Box minH="100vh" bg="gray.50">
      <PageHeader
        title={`${getPageTitle(application.currentRound)} - ${
          application.name
        }`}
        subtitle={`Applied ${formatDate(application.createdAt)} • ${
          application.email
        }`}
        backLink={{
          to: `/hr/dashboard?jobId=${application?.jobId}`,
          label: 'Back to Dashboard',
        }}
        actions={<StatusBadge status={application.overallStatus} size="lg" />}
      />

      <Container maxW="7xl" py={8}>
        <HStack spacing={6} align="start">
          {/* Left Column - Application Details */}
          <VStack spacing={6} flex="2" align="stretch">
            {/* Job & Candidate Info */}
            {application.Job && (
              <Card>
                <CardBody>
                  <Flex justify="space-between" align="flex-start" mb={4}>
                    <VStack align="start" spacing={2}>
                      <Heading size="lg" color="gray.900">
                        {application.Job.title}
                      </Heading>
                      <Text fontSize="lg" color="blue.600" fontWeight="medium">
                        {application.Job.company}
                      </Text>
                    </VStack>
                    <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                      {application.Job.type}
                    </Badge>
                  </Flex>
                  <HStack spacing={6} color="gray.600" mb={6}>
                    <HStack>
                      <Icon as={FaMapPin} />
                      <Text>{application.Job.location}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaDollarSign} />
                      <Text>{application.Job.salary}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaClock} />
                      <Text>Posted {application.Job.posted}</Text>
                    </HStack>
                  </HStack>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader>
                <Heading size="md">Candidate Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Icon as={FaUser} color="blue.500" />
                    <Text fontWeight="medium">{application.name}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaPhone} color="blue.500" />
                    <Text fontWeight="medium">{application.phone}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaEnvelope} color="blue.500" />
                    <ChakraLink
                      href={`mailto:${application.email}`}
                      color="blue.500"
                    >
                      {application.email}
                    </ChakraLink>
                  </HStack>
                  {application.cvLink && (
                    <Box
                      mt={4}
                      border="1px solid #e2e8f0"
                      borderRadius="md"
                      h="600px"
                    >
                      <iframe
                        src={application.cvLink}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                        title="CV Preview"
                      />
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {technicalAssessment && (
              <Card>
                <CardHeader>
                  <Heading size="md">Technical Assessment Results</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text>
                        <strong>Completed:</strong>{' '}
                        {technicalAssessment.completedAt
                          ? new Date(
                              technicalAssessment.completedAt
                            ).toLocaleString('en-GB', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                          : 'N/A'}
                      </Text>
                      <Text>
                        <strong>Time Spent:</strong> {formattedTime}
                      </Text>
                    </HStack>

                    {technicalAssessment.answers &&
                    Object.values(technicalAssessment.answers).some(
                      (code) =>
                        code &&
                        code.trim() !== '{}' &&
                        code.trim() !==
                          'function mergeTwoLists(list1, list2) {\n}'
                    ) ? (
                      Object.entries(technicalAssessment.answers).map(
                        ([qIndex, code]) => {
                          if (
                            !code ||
                            code.trim() === '{}' ||
                            code.trim() ===
                              'function mergeTwoLists(list1, list2) {\n}'
                          )
                            return null;

                          const staticCases =
                            staticTestCases[Number(qIndex)] || [];

                          // Load results: try backend first, fallback to localStorage
                          const backendResults =
                            technicalAssessment.testResults?.[Number(qIndex)] ||
                            [];

                          const localResults: any[] = JSON.parse(
                            localStorage.getItem('testResults') || '[]'
                          );
                          const storedResults =
                            localResults[Number(qIndex)] || [];

                          const mergedTests = staticCases.map((test, index) => {
                            const backendTest = backendResults[index];
                            const storedTest = storedResults[index];
                            return {
                              input: test.input,
                              expected: test.expected,
                              actual:
                                backendTest?.actual ?? storedTest?.actual ?? '', // fallback
                              passed:
                                backendTest?.passed ??
                                storedTest?.passed ??
                                test.expected ===
                                  (backendTest?.actual ??
                                    storedTest?.actual ??
                                    ''),
                            };
                          });

                          const filteredTests = mergedTests.filter(
                            (t) => t.passed === true || t.passed === false
                          );

                          return (
                            <Box
                              key={qIndex}
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              p={4}
                              mb={4}
                            >
                              <Text fontWeight="bold" mb={2}>
                                Question {Number(qIndex) + 1} Solution:
                              </Text>

                              {filteredTests.length > 0 && (
                                <Box
                                  mt={2}
                                  p={2}
                                  bg="gray.50"
                                  borderRadius="md"
                                >
                                  <Text fontWeight="semibold" mb={2}>
                                    Test Cases:
                                  </Text>
                                  {filteredTests.map(
                                    (test: any, idx: number) => (
                                      <Box
                                        key={idx}
                                        border="1px solid"
                                        borderColor={
                                          test.passed ? 'green.300' : 'red.300'
                                        }
                                        borderRadius="md"
                                        p={2}
                                        mb={2}
                                      >
                                        <Text fontSize="sm">
                                          <strong>Input:</strong> {test.input}
                                        </Text>
                                        <Text fontSize="sm">
                                          <strong>Expected:</strong>{' '}
                                          {test.expected}
                                        </Text>
                                        <Text fontSize="sm">
                                          <strong>Actual:</strong> {test.actual}
                                        </Text>
                                        <Text
                                          fontSize="sm"
                                          color={
                                            test.passed
                                              ? 'green.500'
                                              : 'red.500'
                                          }
                                        >
                                          {test.passed
                                            ? '✅ Passed'
                                            : '❌ Failed'}
                                        </Text>
                                      </Box>
                                    )
                                  )}
                                </Box>
                              )}

                              <Box
                                bg="gray.900"
                                borderRadius="md"
                                p={3}
                                overflow="auto"
                                mb={3}
                              >
                                <Text
                                  fontFamily="mono"
                                  fontSize="sm"
                                  color="green.300"
                                  whiteSpace="pre-wrap"
                                >
                                  {code}
                                </Text>
                              </Box>
                            </Box>
                          );
                        }
                      )
                    ) : (
                      <Box textAlign="center" py={10}>
                        <Text color="gray.500" fontSize="md">
                          No solutions submitted
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>

          {/* Right Column - Actions */}
          <VStack spacing={6} flex="1" align="stretch">
            {/* Resume & CV Screening */}
            <Card>
              <CardHeader>
                <Heading size="md">Resume/CV</Heading>
              </CardHeader>
              <CardBody>
                <Button
                  leftIcon={<FaDownload />}
                  onClick={() => window.open(application.cvLink, '_blank')}
                  isDisabled={!application.cvLink}
                  w="full"
                  colorScheme="blue"
                >
                  {application.cvLink ? 'Download CV' : 'CV Not Available'}
                </Button>

                {aiScreeningResult && (
                  <Box
                    mt={4}
                    p={4}
                    border="1px solid"
                    borderColor={
                      aiScreeningResult.decision === 'Pass'
                        ? 'green.300'
                        : 'red.300'
                    }
                    borderRadius="md"
                    bg={
                      aiScreeningResult.decision === 'Pass'
                        ? 'green.50'
                        : 'red.50'
                    }
                  >
                    <Text fontWeight="bold" mb={2}>
                      AI Screening Result (Automated)
                    </Text>
                    <Text>
                      <strong>Decision:</strong> {aiScreeningResult.decision}
                    </Text>
                    <Text>
                      <strong>Score:</strong> {aiScreeningResult.score}/100
                    </Text>
                    <Text mt={2}>
                      <strong>Feedback:</strong> {aiScreeningResult.feedback}
                    </Text>
                  </Box>
                )}

                {!aiScreeningResult && (
                  <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                    <Text color="gray.600" textAlign="center">
                      CV screening will be performed automatically when the
                      application is submitted.
                    </Text>
                  </Box>
                )}
              </CardBody>
            </Card>
            {/* Schedule Technical Interview */}
            {application.currentRound === 'Technical Interview' &&
              application.cvStatus === 'Passed' &&
              !technicalAssessment && (
                <Card>
                  <CardHeader>
                    <Heading size="md">Schedule Mail For Technical Interview</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Date
                        </Text>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                          }}
                        />
                      </Box>
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Time
                        </Text>
                        <input
                          type="time"
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                          }}
                        />
                      </Box>
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Additional Instructions (Optional)
                        </Text>
                        <textarea
                          value={interviewInstructions}
                          onChange={(e) =>
                            setInterviewInstructions(e.target.value)
                          }
                          placeholder="Any specific instructions for the candidate..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            resize: 'vertical',
                          }}
                        />
                      </Box>
                      <Button
                        colorScheme="blue"
                        onClick={handleSendTechnicalAssessment}
                        isLoading={sendingAssessment}
                        isDisabled={!interviewDate || !interviewTime}
                        leftIcon={<FaEnvelope />}
                      >
                        Schedule & Send Assessment
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            {application.currentRound === 'HR Interview' &&
              application.techStatus === 'Passed' && (
                <Card>
                  <CardHeader>
                    <Heading size="md">Schedule Mail For HR Interview</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Date
                        </Text>
                        <input
                          type="date"
                          value={hrInterviewDate}
                          onChange={(e) => setHrInterviewDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                          }}
                        />
                      </Box>
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Time
                        </Text>
                        <input
                          type="time"
                          value={hrInterviewTime}
                          onChange={(e) => setHrInterviewTime(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                          }}
                        />
                      </Box>
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Google Meet Link
                        </Text>
                        <input
                          type="url"
                          value={hrMeetLink}
                          onChange={(e) => setHrMeetLink(e.target.value)}
                          placeholder="https://meet.google.com/xxx-xxxx-xxx"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                          }}
                        />
                      </Box>
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Additional Instructions (Optional)
                        </Text>
                        <textarea
                          value={hrInterviewInstructions}
                          onChange={(e) =>
                            setHrInterviewInstructions(e.target.value)
                          }
                          placeholder="Any specific instructions for the candidate..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            resize: 'vertical',
                          }}
                        />
                      </Box>
                      <Button
                        colorScheme="green"
                        onClick={handleSendHRInterview}
                        isLoading={sendingHRInterview}
                        isDisabled={!hrInterviewDate || !hrInterviewTime}
                        leftIcon={<FaEnvelope />}
                      >
                        Schedule & Send HR Interview
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            {/* Decision Cards */}
            {application.currentRound === 'CV Screening' &&
              renderDecisionCard(
                'CV Screening',
                application.cvStatus,
                cvDecision,
                setCvDecision,
                async () => {
                  setProcessing(true);
                  try {
                    if (cvDecision === 'Passed') {
                      await handleApproveCVAndSchedule();
                    } else {
                      await handleDecision('cv');
                    }
                  } finally {
                    setProcessing(false);
                  }
                },
                rejectionReason,
                setRejectionReason,
                processing
              )}
            {application.currentRound === 'Technical Interview' &&
              renderDecisionCard(
                'Technical Interview',
                application.techStatus,
                techInterviewDecision,
                setTechInterviewDecision,
                async () => {
                  setProcessing(true);
                  try {
                    if (techInterviewDecision === 'Passed') {
                      await handleApproveTechnicalInterview();
                    } else {
                      await handleDecision('tech');
                    }
                  } finally {
                    setProcessing(false);
                  }
                },
                rejectionReason,
                setRejectionReason,
                processing
              )}
            {application.currentRound === 'HR Interview' &&
              renderDecisionCard(
                'HR Interview',
                application.hrStatus,
                hrInterviewDecision,
                setHrInterviewDecision,
                async () => {
                  setProcessing(true);
                  try {
                    if (hrInterviewDecision === 'Passed') {
                      await handleApproveHRInterview();
                    } else {
                      await handleDecision('hr');
                    }
                  } finally {
                    setProcessing(false);
                  }
                },
                rejectionReason,
                setRejectionReason,
                processing
              )}
            {/* Overall Status */}
            {application.currentRound === 'Completed' &&
              (application.overallStatus === 'Selected' ||
                application.overallStatus === 'Rejected') && (
                <Alert
                  status={
                    application.overallStatus === 'Selected'
                      ? 'success'
                      : 'error'
                  }
                  borderRadius="md"
                  flexDirection="column"
                  alignItems="center"
                  textAlign="center"
                  p={8}
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    Application {application.overallStatus}
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    This application has reached its final status.
                  </AlertDescription>
                </Alert>
              )}
          </VStack>
        </HStack>
      </Container>
    </Box>
  );
};
