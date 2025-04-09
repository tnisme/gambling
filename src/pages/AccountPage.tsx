import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaLock, FaHistory, FaWallet, FaCog, FaEdit, FaCheck, FaTimes, FaSignOutAlt, FaGift } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import DepositModal from '../components/DepositModal';
import { 
  updateProfile, 
  changePassword, 
  getTransactionHistory, 
  updateSettings, 
  enableTwoFactorAuth, 
  disableTwoFactorAuth,
  Transaction,
  UserProfile,
  applyCouponCode
} from '../services/accountService';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingCommunications: false
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactionHistory();
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transaction history');
      }
    };

    if (activeTab === 'history') {
      fetchTransactions();
    }
    setError('');
    setSuccess('');
  }, [activeTab]);

  const handleProfileUpdate = async () => {
    try {
      const updatedUser = await updateProfile(profileData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change password');
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      await updateSettings(settings);
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  const handle2FAToggle = async () => {
    try {
      if (is2FAEnabled) {
        await disableTwoFactorAuth();
        setIs2FAEnabled(false);
        setSuccess('Two-factor authentication disabled');
      } else {
        await enableTwoFactorAuth();
        setIs2FAEnabled(true);
        setSuccess('Two-factor authentication enabled');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update two-factor authentication');
    }
  };

  const handleApplyCoupon = async () => {
    setError('');
    setSuccess('');
    if (!couponCode) {
        setError('Please enter a coupon code.');
        return;
    }
    setCouponLoading(true);
    try {
        const updatedUser = await applyCouponCode(couponCode);
        setSuccess('Coupon applied successfully!');
        setCouponCode('');
        setUser(updatedUser);
        setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
        setError(err?.message || 'Failed to apply coupon.');
    } finally {
        setCouponLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDepositSuccess = () => {
    setSuccess('Deposit successful!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <>
      <Header />
      <PageContainer>
        <BackgroundOverlay />
        <ContentWrapper>
          <AccountContainer>
            <Sidebar>
              <SidebarItem 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
              >
                <FaUser /> Profile
              </SidebarItem>
              <SidebarItem 
                active={activeTab === 'balance'} 
                onClick={() => setActiveTab('balance')}
              >
                <FaWallet /> Balance
              </SidebarItem>
              <SidebarItem 
                active={activeTab === 'history'} 
                onClick={() => setActiveTab('history')}
              >
                <FaHistory /> History
              </SidebarItem>
              <SidebarItem 
                active={activeTab === 'coupon'} 
                onClick={() => setActiveTab('coupon')}
              >
                <FaGift /> Coupon
              </SidebarItem>
              <SidebarItem 
                active={activeTab === 'security'} 
                onClick={() => setActiveTab('security')}
              >
                <FaLock /> Security
              </SidebarItem>
              <SidebarItem 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
              >
                <FaCog /> Settings
              </SidebarItem>
              <LogoutButton onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </LogoutButton>
            </Sidebar>

            <MainContent>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              {activeTab === 'profile' && (
                <Section>
                  <SectionTitle>Profile Information</SectionTitle>
                  <ProfileInfo>
                    {!isEditing ? (
                      <>
                        <InfoGroup>
                          <Label>Username</Label>
                          <Value>{user?.username}</Value>
                        </InfoGroup>
                        <InfoGroup>
                          <Label>Email</Label>
                          <Value>{user?.email}</Value>
                        </InfoGroup>
                        <EditButton onClick={() => setIsEditing(true)}>
                          <FaEdit /> Edit Profile
                        </EditButton>
                      </>
                    ) : (
                      <>
                        <InfoGroup>
                          <Label>Username</Label>
                          <Input
                            value={profileData.username || user?.username || ''}
                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          />
                        </InfoGroup>
                        <InfoGroup>
                          <Label>Email</Label>
                          <Input
                            value={profileData.email || user?.email || ''}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          />
                        </InfoGroup>
                        <ButtonGroup>
                          <SaveButton onClick={handleProfileUpdate}>
                            <FaCheck /> Save
                          </SaveButton>
                          <CancelButton onClick={() => setIsEditing(false)}>
                            <FaTimes /> Cancel
                          </CancelButton>
                        </ButtonGroup>
                      </>
                    )}
                  </ProfileInfo>
                </Section>
              )}

              {activeTab === 'balance' && (
                <Section>
                  <SectionTitle>Account Balance</SectionTitle>
                  <BalanceCard>
                    <BalanceAmount>${user?.balance}</BalanceAmount>
                    <BalanceActions>
                      <ActionButton primary onClick={() => setIsDepositModalOpen(true)}>
                        <FaWallet /> Deposit
                      </ActionButton>
                      <ActionButton onClick={() => alert('Withdraw functionality not implemented')}>
                        <FaWallet /> Withdraw
                      </ActionButton>
                    </BalanceActions>
                  </BalanceCard>
                </Section>
              )}

              {activeTab === 'history' && (
                <Section>
                  <SectionTitle>Transaction History</SectionTitle>
                  <TransactionList>
                    {transactions.length > 0 ? transactions.map(transaction => (
                      <TransactionItem key={transaction.id}>
                        <TransactionInfo>
                          <TransactionType>{transaction.type}</TransactionType>
                          <TransactionDate>{new Date(transaction.date).toLocaleString()}</TransactionDate>
                          <TransactionStatus status={transaction.status}>
                            {transaction.status}
                          </TransactionStatus>
                        </TransactionInfo>
                        <TransactionAmount type={transaction.amount >= 0 ? 'positive' : 'negative'}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}$
                        </TransactionAmount>
                      </TransactionItem>
                    )) : (
                      <Value>No transactions yet.</Value>
                    )}
                  </TransactionList>
                </Section>
              )}

              {activeTab === 'coupon' && (
                <Section>
                  <SectionTitle>Apply Coupon Code</SectionTitle>
                  <FormGroup style={{ maxWidth: '400px' }}>
                    <Label>Coupon Code</Label>
                    <Input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter your coupon code"
                      disabled={couponLoading}
                    />
                  </FormGroup>
                  <ActionButton 
                    primary 
                    onClick={handleApplyCoupon} 
                    disabled={couponLoading || !couponCode}
                    style={{ marginTop: '1rem', alignSelf: 'flex-start' }}
                  >
                    {couponLoading ? 'Applying...' : 'Apply Coupon'}
                  </ActionButton>
                </Section>
              )}

              {activeTab === 'security' && (
                <Section>
                  <SectionTitle>Security Settings</SectionTitle>
                  <FormGroup style={{ maxWidth: '400px', marginBottom: '2rem' }}>
                    <Label>Change Password</Label>
                    <Input
                      type="password"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                    <SaveButton onClick={handlePasswordChange} style={{ marginTop: '1rem' }}>
                      Change Password
                    </SaveButton>
                  </FormGroup>

                  <FormGroup>
                    <Label>Two-Factor Authentication (2FA)</Label>
                    <ToggleButton onClick={handle2FAToggle} active={is2FAEnabled}>
                      {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </ToggleButton>
                    <Value style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      {is2FAEnabled ? '2FA is currently enabled.' : 'Enable 2FA for enhanced security.'}
                    </Value>
                  </FormGroup>
                </Section>
              )}

              {activeTab === 'settings' && (
                <Section>
                  <SectionTitle>Account Settings</SectionTitle>
                  <FormGroup>
                    <CheckboxLabel>
                      <Checkbox 
                        type="checkbox" 
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                      />
                      Receive email notifications
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <Checkbox 
                        type="checkbox" 
                        checked={settings.marketingCommunications}
                        onChange={(e) => setSettings({...settings, marketingCommunications: e.target.checked})}
                      />
                      Receive marketing communications
                    </CheckboxLabel>
                  </FormGroup>
                  <SaveButton onClick={handleSettingsUpdate} style={{ marginTop: '1rem' }}>
                    Save Settings
                  </SaveButton>
                </Section>
              )}
            </MainContent>
          </AccountContainer>
        </ContentWrapper>
      </PageContainer>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />
    </>
  );
};

const PageContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding-top: 70px;
  position: relative;
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/path-to-your-background-image.jpg') no-repeat center center fixed;
  background-size: cover;
  filter: blur(5px) brightness(0.4);
  z-index: -1;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const AccountContainer = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
`;

const Sidebar = styled.nav`
  width: 250px;
  background: rgba(20, 20, 20, 0.8);
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
`;

interface SidebarItemProps {
  active?: boolean;
}

const SidebarItem = styled.button<SidebarItemProps>`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.lightGray};
  padding: 1rem 1.5rem;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${props => props.theme.colors.white};
  }

  svg {
    font-size: 1.2rem;
  }
`;

const LogoutButton = styled(SidebarItem)`
  margin-top: auto;
  color: ${props => props.theme.colors.darkRed};
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 3rem;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.lightGray};
  font-size: 0.9rem;
`;

const Value = styled.p`
  color: ${props => props.theme.colors.white};
  font-size: 1rem;
  margin: 0;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid ${props => props.theme.colors.secondary};
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.theme.colors.white};
  font-size: 1rem;
  max-width: 400px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const BaseButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EditButton = styled(BaseButton)`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  align-self: flex-start;

  &:hover {
    background: rgba(255, 215, 0, 0.1);
  }
`;

const SaveButton = styled(BaseButton)`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  align-self: flex-start;

  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
`;

const CancelButton = styled(BaseButton)`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.lightGray};
  color: ${props => props.theme.colors.lightGray};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const BalanceCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BalanceAmount = styled.p`
  color: ${props => props.theme.colors.primary};
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
`;

const BalanceActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled(BaseButton)<{ primary?: boolean }>`
  background: ${props => props.primary ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.primary ? props.theme.colors.background : props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};

  &:hover {
    background: ${props => props.primary ? props.theme.colors.secondary : 'rgba(255, 215, 0, 0.1)'};
  }
`;

const TransactionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionItem = styled.li`
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const TransactionType = styled.span`
  color: ${props => props.theme.colors.white};
  font-weight: 500;
  min-width: 100px;
`;

const TransactionDate = styled.span`
  color: ${props => props.theme.colors.lightGray};
  font-size: 0.9rem;
`;

const TransactionStatus = styled.span<{ status: string }>`
  color: ${props => 
    props.status === 'completed' ? props.theme.colors.secondary :
    props.status === 'pending' ? props.theme.colors.primary :
    props.theme.colors.darkRed
  };
  font-size: 0.9rem;
  text-transform: capitalize;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 5px;
`;

const TransactionAmount = styled.span<{ type: 'positive' | 'negative' }>`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${props => props.type === 'positive' ? props.theme.colors.secondary : props.theme.colors.darkRed};
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.darkRed};
  background: rgba(255, 0, 0, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.secondary};
  background: rgba(0, 255, 0, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 0.7rem 1.5rem;
  border: 1px solid ${props => props.active ? props.theme.colors.darkRed : props.theme.colors.secondary};
  color: ${props => props.active ? props.theme.colors.darkRed : props.theme.colors.secondary};
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-start;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(139, 0, 0, 0.1)' : 'rgba(255, 215, 0, 0.1)'};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.white};
  cursor: pointer;
`;

const Checkbox = styled.input`
  /* Add styles for custom checkbox if desired */
`;

export default AccountPage;
