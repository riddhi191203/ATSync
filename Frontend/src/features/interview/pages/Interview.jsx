import React, { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'

const NAV_ITEMS = [
  { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='16 18 22 12 16 6' /><polyline points='8 6 2 12 8 18' /></svg>) },
  { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' /></svg>) },
]

const getScoreClass = (score) => (score >= 80 ? 'score--high' : score >= 60 ? 'score--mid' : 'score--low')
const first = (item, keys, fallback = '') => keys.map((key) => item?.[key]).find(Boolean) || fallback

const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className='q-card'>
      <button type='button' className='q-card__header' onClick={() => setOpen((value) => !value)}>
        <span className='q-card__index'>Q{index + 1}</span>
        <p className='q-card__question'>{first(item, ['question', 'questionText', 'question_text', 'q', 'prompt'], 'No question provided')}</p>
        <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='6 9 12 15 18 9' /></svg>
        </span>
      </button>
      {open && (
        <div className='q-card__body'>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--intention'>Intention</span>
            <p>{first(item, ['intention', 'intent', 'purpose', 'reason', 'goal'], 'No intention provided')}</p>
          </div>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
            <p>{first(item, ['answer', 'response', 'recommendation', 'solution', 'advice', 'explanation'], 'No answer provided')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const Interview = () => {
  const [activeNav, setActiveNav] = useState('technical')
  const { report, getReportById, loading, getResumePdf } = useInterview()
  const { interviewId } = useParams()

  useEffect(() => { if (interviewId) getReportById(interviewId) }, [interviewId, getReportById])

  if (loading && !report) return <main className='loading-screen'><h1>Loading your interview plan...</h1></main>
  if (!report) return <main className='loading-screen'><h1>No report loaded</h1><p>Please generate a report or select one from Recent Reports.</p></main>

  const score = Number(report.matchScore) || 0
  const genericQuestions = Array.isArray(report.questions)
    ? report.questions
    : Array.isArray(report.interviewQuestions)
      ? report.interviewQuestions
      : Array.isArray(report.interview_questions)
        ? report.interview_questions
        : []

  const technicalQuestions = (Array.isArray(report.technicalQuestions) && report.technicalQuestions.length > 0)
    ? report.technicalQuestions
    : genericQuestions

  const behavioralQuestions = (Array.isArray(report.behavioralQuestions) && report.behavioralQuestions.length > 0)
    ? report.behavioralQuestions
    : genericQuestions

  const skillGaps = Array.isArray(report.skillGaps) && report.skillGaps.length > 0
    ? report.skillGaps
    : Array.isArray(report.skill_gaps) && report.skill_gaps.length > 0
      ? report.skill_gaps
      : Array.isArray(report.gaps) && report.gaps.length > 0
        ? report.gaps
        : Array.isArray(report.missingSkills)
          ? report.missingSkills
          : []

  return (
    <div className='interview-page'>
      <div className='interview-layout'>
        <nav className='interview-nav'>
          <div className='nav-content'>
            <p className='interview-nav__label'>Sections</p>
            {NAV_ITEMS.map((item) => (
              <button key={item.id} type='button' className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`} onClick={() => setActiveNav(item.id)}>
                <span className='interview-nav__icon'>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
          <button type='button' className='button primary-button' onClick={() => getResumePdf(interviewId)}>
            <svg height='0.8rem' style={{ marginRight: '0.8rem' }} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z' /></svg>
            Download Resume
          </button>
        </nav>

        <div className='interview-divider' />
        <main className='interview-content'>
          {activeNav === 'technical' && (
            <section>
              <div className='content-header'><h2>Technical Questions</h2><span className='content-header__count'>{technicalQuestions.length} questions</span></div>
              <div className='q-list'>
                {technicalQuestions.length > 0 ? technicalQuestions.map((q, idx) => <QuestionCard key={idx} item={q} index={idx} />) : <div className='q-card__empty'>No technical questions are available yet. Try regenerating your report.</div>}
              </div>
            </section>
          )}
          {activeNav === 'behavioral' && (
            <section>
              <div className='content-header'><h2>Behavioral Questions</h2><span className='content-header__count'>{behavioralQuestions.length} questions</span></div>
              <div className='q-list'>
                {behavioralQuestions.length > 0 ? behavioralQuestions.map((q, idx) => <QuestionCard key={idx} item={q} index={idx} />) : <div className='q-card__empty'>No behavioral questions are available yet. Try regenerating your report.</div>}
              </div>
            </section>
          )}
        </main>

        <div className='interview-divider' />
        <aside className='interview-sidebar'>
          <div className='match-score'><p className='match-score__label'>Match Score</p><div className={`match-score__ring ${getScoreClass(score)}`}><span className='match-score__value'>{score}</span><span className='match-score__pct'>%</span></div><p className='match-score__sub'>Strong match for this role</p></div>
          <div className='sidebar-divider' />
          <div className='skill-gaps'><p className='skill-gaps__label'>Skill Gaps</p><div className='skill-gaps__list'>{skillGaps.map((gap, idx) => <span key={idx} className={`skill-tag skill-tag--${gap.severity || 'neutral'}`}>{gap.skill || 'Unspecified skill'}</span>)}</div></div>
        </aside>
      </div>
    </div>
  )
}

export default Interview