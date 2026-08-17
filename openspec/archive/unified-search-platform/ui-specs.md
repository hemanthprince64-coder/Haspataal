# Search UI Specifications

## Patient Portal

### Universal Search Bar
```typescript
// Location: Top navigation bar, sticky
// Size: Full width on desktop, icon on mobile
// Features:
// - Voice input button
// - Clear button
// - Loading spinner
// - Keyboard shortcut: Ctrl+K or /

<SearchBar>
  <SearchInput placeholder="Search appointments, prescriptions, bills..." />
  <VoiceButton aria-label="Voice search" />
  <ClearButton />
  <LoadingSpinner />
</SearchBar>
```

### Search Overlay
```typescript
// Full-screen overlay when search active
// Backdrop: blurred background
// Keyboard: Escape to close, Up/Down to navigate

<SearchOverlay visible={isActive}>
  <AutocompletePanel>
    <RecentSearches />
    <Suggestions />
    <Trending />
  </AutocompletePanel>
  
  <ResultsPanel>
    <GroupedResults>
      <AppointmentResults />
      <PrescriptionResults />
      <BillResults />
    </GroupedResults>
    
    <FiltersSidebar>
      <StatusFilter />
      <DateRangeFilter />
    </FiltersSidebar>
  </ResultsPanel>
</SearchOverlay>
```

### Result Cards
```typescript
// Appointment Card
<Card>
  <Icon type="appointment" />
  <Title>Dr. Smith - Cardiology</Title>
  <Subtitle>2024-07-15, 10:00 AM</Subtitle>
  <Metadata>Pending • Hospital: Apollo</Metadata>
  <Actions>
    <ViewButton />
    <RescheduleButton />
  </Actions>
</Card>

// Prescription Card
<Card>
  <Icon type="prescription" />
  <Title>Diabetes Medication</Title>
  <Subtitle>5 medicines • Created: 2024-06-20</Subtitle>
  <Metadata>Completed • Dr. Johnson</Metadata>
</Card>

// Bill Card
<Card>
  <Icon type="bill" />
  <Title>Consultation Bill</Title>
  <Subtitle>₹1,250 • Due: 2024-07-01</Subtitle>
  <Metadata>Pending Payment</Metadata>
</Card>
```

### States
```typescript
// Loading State
<LoadingState>
  <Skeleton count={5} />
  <Text>Loading results...</Text>
</LoadingState>

// Empty State
<EmptyState>
  <Icon type="search" />
  <Title>No results found</Title>
  <Subtitle>Try different keywords or filters</Subtitle>
  <Suggestions>
    <Suggestion>Search for "diabetes"</Suggestion>
    <Suggestion>Try "last month" for recent</Suggestion>
  </Suggestions>
</EmptyState>

// Error State
<ErrorState>
  <Icon type="error" />
  <Title>Search unavailable</Title>
  <RetryButton />
</ErrorState>
```

## Doctor Portal

### Universal Search Bar
```typescript
// Location: Header, persistent
// Features: Quick filters dropdown

<SearchBar>
  <QuickFilters>
    <PatientFilter active />
    <AppointmentFilter />
    <LabFilter />
  </QuickFilters>
  <SearchInput placeholder="Search patients, records, lab orders..." />
</SearchBar>
```

### Grouped Results
```typescript
<GroupedResults>
  <Section title="Patients" count={12}>
    <PatientCard patient={p} highlight={query} />
  </Section>
  
  <Section title="Lab Orders" count={3}>
    <LabOrderCard order={o} />
  </Section>
  
  <Section title="Prescriptions" count={5}>
    <PrescriptionCard rx={rx} />
  </Section>
</GroupedResults>
```

### Patient Search Card
```typescript
<Card>
  <Avatar src={patient.photo} />
  <Title>{patient.name}</Title>
  <Subtitle>{patient.phone} • Age: {patient.age}</Subtitle>
  <Badges>
    <Badge type="journey">{patient.activeJourneys}</Badge>
    <Badge type="high-risk" if={patient.risk > 0.7} />
  </Badges>
  <Actions>
    <ViewProfile />
    <CreateVisit />
  </Actions>
</Card>
```

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+K | Open search |
| Esc | Close search |
| ↓ | Next result |
| ↑ | Previous result |
| Enter | Open selected |
| Ctrl+1/2/3 | Switch result group |

## Hospital HMS

### Admin Search
```typescript
// Location: Admin sidebar
// Features: Entity type selector

<SearchBar>
  <EntityTypeSelector>
    <PatientIcon selected />
    <DoctorIcon />
    <StaffIcon />
    <BillIcon />
  </EntityTypeSelector>
  <SearchInput placeholder="Search all entities..." />
  <AdvancedButton>Filters</AdvancedButton>
</SearchBar>
```

### Filters Sidebar
```typescript
<Filters>
  <Accordion title="Status">
    <MultiSelect options={statusOptions} />
  </Accordion>
  
  <Accordion title="Department">
    <MultiSelect options={departmentOptions} />
  </Accordion>
  
  <Accordion title="Date Range">
    <DatePicker from="date_from" to="date_to" />
  </Accordion>
  
  <Accordion title="Staff Role">
    <RadioGroup options={roleOptions} />
  </Accordion>
</Filters>
```

### Result Table (Desktop)
```typescript
<Table>
  <Header>
    <Column>Name</Column>
    <Column>Type</Column>
    <Column>Hospital</Column>
    <Column>Status</Column>
    <Column>Last Activity</Column>
  </Header>
  <Row clickable>
    <Cell><Highlight>{name}</Highlight></Cell>
    <Cell><Badge>{type}</Badge></Cell>
    ...
  </Row>
</Table>
```

## Admin Portal

### Search Analytics Dashboard
```typescript
<Dashboard>
  <KPIGrid>
    <KPICard title="Total Searches" value="24,890" trend="+12%" />
    <KPICard title="Avg. Response Time" value="42ms" trend="-8%" />
    <KPICard title="Zero Results" value="3.2%" trend="-15%" />
    <KPICard title="CTR" value="68%" trend="+5%" />
  </KPIGrid>
  
  <Charts>
    <LineChart title="Search Volume (24h)" data={volumeData} />
    <BarChart title="Popular Queries" data={popularQueries} />
    <PieChart title="Entity Distribution" data={entityData} />
  </Charts>
</Dashboard>
```

### Entity Search Analytics
```typescript
<Tabs>
  <Tab id="doctor">
    <Metric name="Searches" value="8,420" />
    <Metric name="Avg Rank Position" value="2.3" />
    <Metric name="Click Through Rate" value="78%" />
  </Tab>
  
  <Tab id="patient">
    <Metric name="Searches" value="12,050" />
    <Metric name="Avg Rank Position" value="1.8" />
    <Metric name="Zero Results" value="2.1%" />
  </Tab>
  
  <Tab id="journey">
    <Metric name="Searches" value="1,230" />
    <Metric name="Completion Rate" value="85%" />
  </Tab>
</Tabs>
```

### Search Trends
```typescript
<TrendAnalysis>
  <QueryTrends>
    <Trend query="diabetes" volume={1240} growth={15} />
    <Trend query="hypertension" volume={980} growth={8} />
    <Trend query="vaccination" volume={2100} growth={22} />
  </QueryTrends>
  
  <TimeTrends>
    <Metric period="Morning" avgTime={35} />
    <Metric period="Afternoon" avgTime={48} />
    <Metric period="Night" avgTime={62} />
  </TimeTrends>
</TrendAnalysis>
```

## Accessibility

### Standards Compliance
- **WCAG 2.1 AA** compliant
- **Keyboard navigation**: All interactions accessible
- **Screen reader**: ARIA labels for all elements
- **Color contrast**: 4.5:1 minimum

### Dark Mode
```css
/* prefers-color-scheme: dark */
.search-overlay { background: #1a1a1a; color: #fff; }
.result-card { 
  background: #252525; 
  border: 1px solid #333;
}
.filter-sidebar { background: #1e1e1e; }
```

### Mobile First
```typescript
// Breakpoints
// - Mobile: <768px (overlay, single column)
// - Tablet: 768-1024px (split view)
// - Desktop: >1024px (sidebar + results)

// Touch targets: minimum 44px
// Font size: minimum 16px
// Scroll: momentum scrolling enabled
```

## Performance Optimizations

### Virtualized Lists
```typescript
// Results list: 100+ virtual items
<VirtualList itemCount={total} itemSize={80}>
  {({ index, style }) => (
    <div style={style}>
      <ResultCard result={results[index]} />
    </div>
  )}
</VirtualList>
```

### Prefetch
```typescript
// Prefetch on hover for next page
// Cache autocomplete for 60s
// Warm popular queries on app load
```

### Bundle Splitting
```javascript
// Search UI code-split
const SearchOverlay = lazy(() => import('./SearchOverlay'));
<React.Suspense fallback={<Spinner />}>
  <SearchOverlay />
</React.Suspense>
```