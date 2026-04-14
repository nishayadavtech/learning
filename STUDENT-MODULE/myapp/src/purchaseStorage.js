export const getPurchaseStorageKeys = (studentInfo) => {
  if (!studentInfo) {
    return [];
  }

  return [
    studentInfo?.student_id
      ? `purchasedCourses_${studentInfo.student_id}`
      : null,
    studentInfo?.email ? `purchasedCourses_${studentInfo.email}` : null,
  ].filter(Boolean);
};

export const getPaymentStorageKeys = (studentInfo) => {
  if (!studentInfo) {
    return [];
  }

  return [
    studentInfo?.student_id ? `paymentHistory_${studentInfo.student_id}` : null,
    studentInfo?.email ? `paymentHistory_${studentInfo.email}` : null,
  ].filter(Boolean);
};

export const getCoursePrice = (course) => {
  const discountPrice = Number(
    course?.discount_price ?? course?.discountPrice ?? course?.sale_price
  );
  const originalPrice = Number(
    course?.original_price ?? course?.originalPrice ?? course?.price ?? 0
  );

  if (Number.isFinite(discountPrice) && discountPrice > 0) {
    return discountPrice;
  }

  if (Number.isFinite(originalPrice) && originalPrice > 0) {
    return originalPrice;
  }

  return 0;
};

export const getLocalPurchasedCourses = (studentInfo) => {
  const storageKeys = getPurchaseStorageKeys(studentInfo);

  if (storageKeys.length === 0) {
    return [];
  }

  try {
    return storageKeys.flatMap((key) =>
      JSON.parse(localStorage.getItem(key) || "[]")
    );
  } catch (error) {
    console.error("Local purchased courses parse error:", error);
    return [];
  }
};

export const savePurchasedCoursesToLocal = (studentInfo, coursesToSave) => {
  if (!studentInfo || !Array.isArray(coursesToSave) || coursesToSave.length === 0) {
    return;
  }

  const storageKeys = getPurchaseStorageKeys(studentInfo);

  try {
    storageKeys.forEach((storageKey) => {
      const existingCourses = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const mergedMap = new Map();

      [...existingCourses, ...coursesToSave].forEach((course) => {
        const courseId = Number(course?.course_id ?? course?.id);

        if (Number.isFinite(courseId)) {
          mergedMap.set(courseId, { ...course, course_id: courseId });
        }
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(mergedMap.values()))
      );
    });
  } catch (error) {
    console.error("Failed to save purchased courses locally:", error);
  }
};

export const getLocalPaymentHistory = (studentInfo) => {
  const storageKeys = getPaymentStorageKeys(studentInfo);

  if (storageKeys.length === 0) {
    return [];
  }

  try {
    return storageKeys.flatMap((key) =>
      JSON.parse(localStorage.getItem(key) || "[]")
    );
  } catch (error) {
    console.error("Local payment history parse error:", error);
    return [];
  }
};

export const savePaymentHistoryToLocal = (
  studentInfo,
  coursesToSave,
  paymentId = ""
) => {
  if (!studentInfo || !Array.isArray(coursesToSave) || coursesToSave.length === 0) {
    return;
  }

  const storageKeys = getPaymentStorageKeys(studentInfo);
  const paymentEntries = coursesToSave.map((course) => {
    const courseId = Number(course?.course_id ?? course?.id);

    return {
      course_id: courseId,
      course_name: course?.course_name || course?.title || "Course",
      amount: getCoursePrice(course),
      payment_id: paymentId,
      paid_at: new Date().toISOString(),
      course,
    };
  });

  try {
    storageKeys.forEach((storageKey) => {
      const existingPayments = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      const mergedMap = new Map();

      [...existingPayments, ...paymentEntries].forEach((payment) => {
        const courseId = Number(payment?.course_id);

        if (Number.isFinite(courseId)) {
          mergedMap.set(courseId, payment);
        }
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(mergedMap.values()))
      );
    });
  } catch (error) {
    console.error("Failed to save payment history locally:", error);
  }
};
